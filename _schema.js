// paste this into your graph cool console

type File @model {
  contentType: String!
  createdAt: DateTime!
  id: ID! @isUnique
  name: String!
  secret: String! @isUnique
  size: Int!
  updatedAt: DateTime!
  url: String! @isUnique
  image: Image @relation(name: "ImageOnFile")
  post: Post @relation(name: "PostOnFile")
  profile: Profile @relation(name: "ProfileOnFile")
  tribe: Tribe @relation(name: "TribeOnFile")
}

type User @model {
  createdAt: DateTime!
  email: String @isUnique
  id: ID! @isUnique
  password: String
  subscriptionId: String
  updatedAt: DateTime!
  comment: Comment @relation(name: "CommentOnUser")
  posts: [Post!]! @relation(name: "PostOnUser")
  profile: Profile @relation(name: "ProfileOnUser")
  request: Request @relation(name: "RequestOnUser")
  tribeRoles: [TribeRole!]! @relation(name: "TribeRoleOnUser")
}

type Comment @model {
  body: String!
  id: ID! @isUnique
  post: Post @relation(name: "CommentOnPost")
  user: User @relation(name: "CommentOnUser")
}

type Design @model {
  feedBackgroundColor: String! @defaultValue(value: "FFFFFF")
  headerBackgroundColor: String! @defaultValue(value: "FFFFFF")
  headerTextColor: String! @defaultValue(value: "000000")
  iconColor: String! @defaultValue(value: "000000")
  id: ID! @isUnique
  messageBoxBackground: String! @defaultValue(value: "Light")
  messageBoxTextColor: String! @defaultValue(value: "000000")
  messagePlaceholderText: String
  postBackgroundColor: String! @defaultValue(value: "FFFFFF")
  postHighlightColor: String! @defaultValue(value: "000000")
  postTextColor: String! @defaultValue(value: "000000")
  statusBarColor: String! @defaultValue(value: "Black")
  tribe: Tribe @relation(name: "DesignOnTribe")
}

type Image @model {
  backgroundColor: String! @defaultValue(value: "FFFFFF")
  bodyColor: String! @defaultValue(value: "000000")
  description: String
  file: File @relation(name: "ImageOnFile")
  id: ID! @isUnique
  imageHeight: String! @defaultValue(value: "Banner")
  sectionBlock: SectionBlock @relation(name: "ImageOnSectionBlock")
  titleColor: String! @defaultValue(value: "000000")
  title: String
}

type Post @model {
  body: String
  comments: [Comment!]! @relation(name: "CommentOnPost")
  file: File @relation(name: "PostOnFile")
  id: ID! @isUnique
  tribe: Tribe @relation(name: "PostOnTribe")
  user: User @relation(name: "PostOnUser")
  createdAt: DateTime!
}

type Profile @model {
  file: File @relation(name: "ProfileOnFile")
  id: ID! @isUnique
  name: String
  tagline: String
  user: User @relation(name: "ProfileOnUser")
}

type Request @model {
  id: ID! @isUnique
  message: String
  tribe: Tribe @relation(name: "RequestOnTribe")
  user: User @relation(name: "RequestOnUser")
}

type Section @model {
  id: ID! @isUnique
  sectionBlocks: [SectionBlock!]! @relation(name: "SectionBlockOnSection")
  tribe: Tribe @relation(name: "SectionOnTribe")
  order: Int! @defaultValue(value: 1)
  title: String!
}

type SectionBlock @model {
  id: ID! @isUnique
  image: Image @relation(name: "ImageOnSectionBlock")
  section: Section @relation(name: "SectionBlockOnSection")
  text: Text @relation(name: "TextOnSectionBlock")
  order: Int! @defaultValue(value: 1)
  type: String!
}

type Text @model {
  backgroundColor: String! @defaultValue(value: "FFFFFF")
  body: String
  bodyColor: String! @defaultValue(value: "000000")
  heading: String
  headingColor: String! @defaultValue(value: "000000")
  id: ID! @isUnique
  sectionBlock: SectionBlock @relation(name: "TextOnSectionBlock")
  subHeading: String
  subHeadingColor: String! @defaultValue(value: "000000")
}

type Tribe @model {
  design: Design @relation(name: "DesignOnTribe")
  feedTitle: String! @defaultValue(value: "Feed")
  file: File @relation(name: "TribeOnFile")
  id: ID! @isUnique
  joinText: String! @defaultValue(value: "Request to join")
  posts: [Post!]! @relation(name: "PostOnTribe")
  requests: [Request!]! @relation(name: "RequestOnTribe")
  sections: [Section!]! @relation(name: "SectionOnTribe")
  showFeed: Boolean! @defaultValue(value: true)
  title: String!
  tribeRoles: [TribeRole!]! @relation(name: "TribeOnTribeRole")
}

type TribeRole @model {
  id: ID! @isUnique
  role: String! @defaultValue(value: "member")
  tribe: Tribe @relation(name: "TribeOnTribeRole")
  user: User @relation(name: "TribeRoleOnUser")
}
