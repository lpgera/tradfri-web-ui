import React, { useEffect } from 'react'
import { Card, Col, Result, Row, Skeleton } from 'antd'
import { useQuery, gql } from '@apollo/client'
import Group from './Group'
import { GroupsQuery } from './Groups.types.gen'
import Scenes from './Scenes'

const columnSizes = {
  xs: 24,
  sm: 12,
  md: 8,
  lg: 6,
}

const Groups = () => {
  const { data, refetch, loading, error } = useQuery<GroupsQuery>(
    gql`
      query Groups {
        groups {
          id
          name
          accessories {
            id
            name
            type
            alive
            onOff
            dimmer
            battery
            colorTemperature
          }
        }
      }
    `
  )

  useEffect(() => {
    const listener = async () => {
      if (!document.hidden) {
        await refetch()
      }
    }
    window.addEventListener('visibilitychange', listener)
    return () => {
      window.removeEventListener('visibilitychange', listener)
    }
  }, [refetch])

  const groups = data?.groups ?? []

  return (
    <>
      <Scenes
        onChange={async () => {
          await refetch()
        }}
      />
      <Row gutter={[16, 16]}>
        {loading ? (
          <Col key="loading" {...columnSizes}>
            <Card>
              <Skeleton active={true} />
            </Card>
          </Col>
        ) : error ? (
          <Col span={24}>
            <Result status="error" title="Error" subTitle={error.message} />
          </Col>
        ) : (
          groups.map((group) => (
            <Col key={group.id} {...columnSizes}>
              <Group {...group} refetch={refetch} />
            </Col>
          ))
        )}
      </Row>
    </>
  )
}

export default Groups
