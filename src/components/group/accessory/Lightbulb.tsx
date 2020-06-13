import React, { useEffect, useState } from 'react'
import { Slider, Typography } from 'antd'
import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {
  AccessoryDimmerMutation,
  AccessoryDimmerMutationVariables,
} from './Lightbulb.types.gen'

type Props = {
  id: number
  name: string
  dimmer: number
  refetch: () => Promise<any>
}

const Lightbulb = (props: Props) => {
  const [value, setValue] = useState(0)
  useEffect(() => {
    setValue(props.dimmer)
  }, [props.dimmer])
  const [accessoryDimmer] = useMutation<
    AccessoryDimmerMutation,
    AccessoryDimmerMutationVariables
  >(
    gql`
      mutation AccessoryDimmer($id: Int!, $dimmer: Float!) {
        accessoryDimmer(id: $id, dimmer: $dimmer)
      }
    `
  )

  return (
    <>
      <Typography.Paragraph>{props.name}</Typography.Paragraph>
      <Slider
        min={0}
        max={100}
        value={value}
        onChange={(newValue) => setValue(newValue as number)}
        onAfterChange={async (newValue) => {
          await accessoryDimmer({
            variables: { id: props.id, dimmer: newValue as number },
          })
          setTimeout(() => props.refetch(), 3000)
        }}
      />
    </>
  )
}

export default Lightbulb