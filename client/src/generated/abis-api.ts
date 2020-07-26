import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  Json: any;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};



export enum SortOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type EntriesPage = {
  __typename?: 'EntriesPage';
  first: Scalars['String'];
  last: Scalars['String'];
  order: SortOrder;
  count: Scalars['Int'];
  entries: Array<Entry>;
};

export enum AgentType {
  Profile = 'Profile',
  Companion = 'Companion',
  Singleton = 'Singleton'
}

export type Agent = {
  __typename?: 'Agent';
  id: Scalars['Int'];
  createdAt: Scalars['DateTime'];
  type: AgentType;
  timezoneOffset?: Maybe<Scalars['Float']>;
  name: Scalars['String'];
  groups?: Maybe<Array<Group>>;
  memberships?: Maybe<Array<Membership>>;
};

export type Membership = {
  __typename?: 'Membership';
  id: Scalars['Int'];
  createdAt: Scalars['DateTime'];
  member: Agent;
  group: Group;
};

export enum GroupType {
  Stash = 'Stash',
  Share = 'Share',
  Channel = 'Channel',
  Room = 'Room'
}

export type Group = {
  __typename?: 'Group';
  id: Scalars['Int'];
  createdAt: Scalars['DateTime'];
  volatile: Scalars['Boolean'];
  ownerId: Scalars['Int'];
  name: Scalars['String'];
  type: GroupType;
  owner?: Maybe<Agent>;
  members?: Maybe<Array<Membership>>;
  entries?: Maybe<EntriesPage>;
};


export type GroupEntriesArgs = {
  sort?: Maybe<SortOrder>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
};

export enum EntryType {
  Empty = 'Empty',
  Data = 'Data',
  Definition = 'Definition'
}

export type Entry = {
  __typename?: 'Entry';
  id: Scalars['Int'];
  createdAt: Scalars['DateTime'];
  ownerId: Scalars['Int'];
  owner?: Maybe<Agent>;
  groupId: Scalars['Int'];
  group?: Maybe<Group>;
  type: EntryType;
  name: Scalars['String'];
  data?: Maybe<Scalars['Json']>;
};

export type Server = {
  __typename?: 'Server';
  timezoneOffset: Scalars['Float'];
  systemAgents: Array<Agent>;
};

export type Query = {
  __typename?: 'Query';
  myProfile: Agent;
  myServer: Server;
  readDefinitions: Array<Entry>;
  readEntries?: Maybe<EntriesPage>;
};


export type QueryReadDefinitionsArgs = {
  groupId: Scalars['Int'];
};


export type QueryReadEntriesArgs = {
  groupId: Scalars['Int'];
  sort?: Maybe<SortOrder>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
};

export type ActionResponse = {
  success: Scalars['Boolean'];
  errorMessage?: Maybe<Scalars['String']>;
};

export type CreateSessionResponse = ActionResponse & {
  __typename?: 'CreateSessionResponse';
  success: Scalars['Boolean'];
  errorMessage?: Maybe<Scalars['String']>;
  jwt: Scalars['String'];
};

export type SendResponse = ActionResponse & {
  __typename?: 'SendResponse';
  success: Scalars['Boolean'];
  errorMessage?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createSession: CreateSessionResponse;
  send?: Maybe<SendResponse>;
};


export type MutationSendArgs = {
  event: Scalars['Json'];
};

export type Subscription = {
  __typename?: 'Subscription';
  event: Scalars['Json'];
};

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}


export type CreateSessionMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateSessionMutation = (
  { __typename?: 'Mutation' }
  & { createSession: (
    { __typename?: 'CreateSessionResponse' }
    & Pick<CreateSessionResponse, 'success' | 'errorMessage' | 'jwt'>
  ) }
);

export type SendMutationVariables = Exact<{
  event: Scalars['Json'];
}>;


export type SendMutation = (
  { __typename?: 'Mutation' }
  & { send?: Maybe<(
    { __typename?: 'SendResponse' }
    & Pick<SendResponse, 'success' | 'errorMessage'>
  )> }
);

export type MyServerQueryVariables = Exact<{ [key: string]: never; }>;


export type MyServerQuery = (
  { __typename?: 'Query' }
  & { myServer: (
    { __typename?: 'Server' }
    & { systemAgents: Array<(
      { __typename?: 'Agent' }
      & Pick<Agent, 'id' | 'name'>
    )> }
  ) }
);

export type NewEventSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NewEventSubscription = (
  { __typename?: 'Subscription' }
  & Pick<Subscription, 'event'>
);


export const CreateSession = gql`
    mutation createSession {
  createSession {
    success
    errorMessage
    jwt
  }
}
    `;
export const Send = gql`
    mutation send($event: Json!) {
  send(event: $event) {
    success
    errorMessage
  }
}
    `;
export const MyServer = gql`
    query myServer {
  myServer {
    systemAgents {
      id
      name
    }
  }
}
    `;
export const NewEvent = gql`
    subscription newEvent {
  event
}
    `;