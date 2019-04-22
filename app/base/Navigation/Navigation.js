import React from "react"
import { createStackNavigator } from "react-navigation"
import { View, Image } from "react-native"

import Loading from '@ui/Loading'

import { graphql, compose } from "react-apollo"
import gql from "graphql-tag"

import Onboarding from "app/screens/Onboarding"
import Home from "app/screens/Home"
import NewTribe from "app/screens/NewTribe"
import Tribe from "app/screens/Tribe"
import TribeSettings from "app/screens/TribeSettings"
import SectionSettings from "app/screens/SectionSettings"
import BlockSettings from "app/screens/BlockSettings"
import ProfileSettings from "app/screens/ProfileSettings"
import AllTribes from "app/screens/AllTribes"

const Navigation = createStackNavigator({
  Home: {
    screen: Home
  },
  NewTribe: {
    screen: NewTribe
  },
  Tribe: {
    screen: Tribe
  },
  TribeSettings: {
    screen: TribeSettings
  },
  SectionSettings: {
    screen: SectionSettings
  },
  BlockSettings: {
    screen: BlockSettings
  },
  ProfileSettings: {
    screen: ProfileSettings
  },
  AllTribes: {
    screen: AllTribes
  },
})

const NavWrapper = ({ loading, user }) => {
  if (loading) return (
    <Loading />
  )
  if (!user) return <Onboarding />
  return <Navigation screenProps={{ user }} />
}

const userQuery = gql`
  query userQuery {
    user {
      id
      email
      profile {
        id
        name
        tagline
        file {
          id
          url
        }
      }
      tribeRoles {
        id
        role
        tribe {
          id
          title
          joinText
          showFeed
          feedTitle
          file {
            id
            url
          }
          design {
            id
            statusBarColor
            headerBackgroundColor
            headerTextColor
            messageBoxBackground
            messageBoxTextColor
            messagePlaceholderText
            iconColor
            feedBackgroundColor
            postBackgroundColor
            postTextColor
          }
          sections(orderBy: order_ASC) {
            id
            order
            title
            sectionBlocks(orderBy: order_ASC) {
              id
              text {
                id
                heading
                subHeading
                body
                backgroundColor
                headingColor
                subHeadingColor
                bodyColor
              }
              image {
                id
                imageHeight
                title
                description
                backgroundColor
                titleColor
                bodyColor
                file {
                  id
                  url
                }
              }
            }
          }
          tribeRoles {
            id
            user {
              id
              profile {
                id
                name
                tagline
                file {
                  id
                  url
                }
              }
            }
          }
          posts(orderBy: createdAt_DESC) {
            id
            body
            createdAt
            file {
              id
              url
            }
            user {
              id
              profile {
                id
                name
                file {
                  id
                  url
                }
              }
            }
          }
        }
      }
    }
  }
`

export default graphql(userQuery, {
  props: ({ data }) => ({ ...data })
})(NavWrapper)
