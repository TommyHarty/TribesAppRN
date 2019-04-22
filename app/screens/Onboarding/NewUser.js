import React, { Component } from "react"
import { Text, View } from "react-native"

import { graphql, compose } from "react-apollo"
import gql from "graphql-tag"

import UserForm from "./UserForm"
import { signIn } from "app/loginUtils"

class NewUser extends Component {
  createUser = async ({ email, password }) => {
    try {
      const user = await this.props.createUser({
        variables: { email, password, }
      })
      const signin = await this.props.signinUser({
        variables: { email, password }
      })
      signIn(signin.data.signinUser.token)
      this.props.client.resetStore()
      this.props.createProfile({
        variables: {
          userId: user.data.createUser.id,
        }
      })
    } catch (e) {
      console.log(e)
      try {
        const signin = await this.props.signinUser({
          variables: { email, password }
        })
        signIn(signin.data.signinUser.token)
        this.props.client.resetStore()
      } catch (e) {
        console.log(e)
      }
    }
  }

  render() {
    return (
      <UserForm type="Register" onSubmit={this.createUser} changeScreen={this.props.setToLogin} />
    )
  }
}

const createUser = gql`
  mutation createUser($email: String!, $password: String!,) {
    createUser(
      authProvider: { email: { email: $email, password: $password } },
    ) {
      id
    }
  }
`

const signinUser = gql`
  mutation signinUser($email: String!, $password: String!) {
    signinUser(email: { email: $email, password: $password }) {
      token
    }
  }
`

const createProfile = gql`
  mutation createProfile($userId: ID!,) {
    createProfile(userId: $userId,) {
      id
    }
  }
`

export default compose(
  graphql(signinUser, { name: "signinUser" }),
  graphql(createUser, { name: "createUser" }),
  graphql(createProfile, { name: "createProfile" }),
)(NewUser)
