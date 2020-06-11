import { gql } from 'apollo-server'
import { Resolvers } from '../resolvers.gen'
import { AccessoryTypes } from 'node-tradfri-client'

export const typeDefs = gql`
  enum AccessoryType {
    REMOTE
    SLAVE_REMOTE
    LIGHTBULB
    PLUG
    MOTION_SENSOR
    SIGNAL_REPEATER
    BLIND
    SOUND_REMOTE
  }

  type Accessory {
    id: Int!
    name: String!
    type: AccessoryType!
    alive: Boolean!
    battery: Int
    onOff: Boolean
    dimmer: Float
  }

  extend type Group {
    accessories: [Accessory!]!
  }

  extend type Mutation {
    accessoryOnOff(id: Int!, onOff: Boolean!): String
    accessoryDimmer(id: Int!, dimmer: Float!): String
  }
`

export const resolvers: Resolvers = {
  AccessoryType: {
    REMOTE: AccessoryTypes.remote,
    SLAVE_REMOTE: AccessoryTypes.slaveRemote,
    LIGHTBULB: AccessoryTypes.lightbulb,
    PLUG: AccessoryTypes.plug,
    MOTION_SENSOR: AccessoryTypes.motionSensor,
    SIGNAL_REPEATER: AccessoryTypes.signalRepeater,
    BLIND: AccessoryTypes.blind,
    SOUND_REMOTE: AccessoryTypes.soundRemote,
  },
  Accessory: {
    id: ({ instanceId }) => {
      return instanceId
    },
    battery: ({ deviceInfo: { battery } }) => {
      return battery
    },
    onOff: ({ lightList = [], plugList = [] }) => {
      return lightList[0]?.onOff ?? plugList[0]?.onOff
    },
    dimmer: ({ lightList = [] }) => {
      return lightList[0]?.dimmer
    },
  },
  Group: {
    accessories: ({ deviceIDs }, _, { tradfriClient }) => {
      return deviceIDs.map((deviceID) => tradfriClient.devices[deviceID])
    },
  },
  Mutation: {
    accessoryOnOff: async (_, { id, onOff }, { tradfriClient }) => {
      const accessory = tradfriClient.devices[id]
      switch (accessory.type) {
        case AccessoryTypes.plug:
          await tradfriClient.operatePlug(accessory, { onOff })
          break
        case AccessoryTypes.lightbulb:
          await tradfriClient.operateLight(accessory, { onOff })
          break
      }
      return null
    },
    accessoryDimmer: async (_, { id, dimmer }, { tradfriClient }) => {
      const accessory = tradfriClient.devices[id]
      await tradfriClient.operateLight(accessory, {
        dimmer,
        transitionTime: dimmer > 0 ? 2 : undefined,
      })
      return null
    },
  },
}
