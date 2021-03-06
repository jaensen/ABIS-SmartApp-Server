import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  Json: any;
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

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type isTypeOfResolverFn<T = {}> = (obj: T, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>,
  Json: ResolverTypeWrapper<Scalars['Json']>,
  SortOrder: SortOrder,
  EntriesPage: ResolverTypeWrapper<EntriesPage>,
  String: ResolverTypeWrapper<Scalars['String']>,
  Int: ResolverTypeWrapper<Scalars['Int']>,
  AgentType: AgentType,
  Agent: ResolverTypeWrapper<Agent>,
  Float: ResolverTypeWrapper<Scalars['Float']>,
  Membership: ResolverTypeWrapper<Membership>,
  GroupType: GroupType,
  Group: ResolverTypeWrapper<Group>,
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
  EntryType: EntryType,
  Entry: ResolverTypeWrapper<Entry>,
  Server: ResolverTypeWrapper<Server>,
  Query: ResolverTypeWrapper<{}>,
  ActionResponse: ResolversTypes['CreateSessionResponse'] | ResolversTypes['SendResponse'],
  CreateSessionResponse: ResolverTypeWrapper<CreateSessionResponse>,
  SendResponse: ResolverTypeWrapper<SendResponse>,
  Mutation: ResolverTypeWrapper<{}>,
  Subscription: ResolverTypeWrapper<{}>,
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  DateTime: Scalars['DateTime'],
  Json: Scalars['Json'],
  SortOrder: SortOrder,
  EntriesPage: EntriesPage,
  String: Scalars['String'],
  Int: Scalars['Int'],
  AgentType: AgentType,
  Agent: Agent,
  Float: Scalars['Float'],
  Membership: Membership,
  GroupType: GroupType,
  Group: Group,
  Boolean: Scalars['Boolean'],
  EntryType: EntryType,
  Entry: Entry,
  Server: Server,
  Query: {},
  ActionResponse: ResolversParentTypes['CreateSessionResponse'] | ResolversParentTypes['SendResponse'],
  CreateSessionResponse: CreateSessionResponse,
  SendResponse: SendResponse,
  Mutation: {},
  Subscription: {},
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime'
}

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Json'], any> {
  name: 'Json'
}

export type EntriesPageResolvers<ContextType = any, ParentType extends ResolversParentTypes['EntriesPage'] = ResolversParentTypes['EntriesPage']> = ResolversObject<{
  first?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  last?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  order?: Resolver<ResolversTypes['SortOrder'], ParentType, ContextType>,
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  entries?: Resolver<Array<ResolversTypes['Entry']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type AgentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Agent'] = ResolversParentTypes['Agent']> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>,
  type?: Resolver<ResolversTypes['AgentType'], ParentType, ContextType>,
  timezoneOffset?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  groups?: Resolver<Maybe<Array<ResolversTypes['Group']>>, ParentType, ContextType>,
  memberships?: Resolver<Maybe<Array<ResolversTypes['Membership']>>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type MembershipResolvers<ContextType = any, ParentType extends ResolversParentTypes['Membership'] = ResolversParentTypes['Membership']> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>,
  member?: Resolver<ResolversTypes['Agent'], ParentType, ContextType>,
  group?: Resolver<ResolversTypes['Group'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type GroupResolvers<ContextType = any, ParentType extends ResolversParentTypes['Group'] = ResolversParentTypes['Group']> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>,
  volatile?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  ownerId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  type?: Resolver<ResolversTypes['GroupType'], ParentType, ContextType>,
  owner?: Resolver<Maybe<ResolversTypes['Agent']>, ParentType, ContextType>,
  members?: Resolver<Maybe<Array<ResolversTypes['Membership']>>, ParentType, ContextType>,
  entries?: Resolver<Maybe<ResolversTypes['EntriesPage']>, ParentType, ContextType, RequireFields<GroupEntriesArgs, never>>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type EntryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Entry'] = ResolversParentTypes['Entry']> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>,
  ownerId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  owner?: Resolver<Maybe<ResolversTypes['Agent']>, ParentType, ContextType>,
  groupId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  group?: Resolver<Maybe<ResolversTypes['Group']>, ParentType, ContextType>,
  type?: Resolver<ResolversTypes['EntryType'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  data?: Resolver<Maybe<ResolversTypes['Json']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type ServerResolvers<ContextType = any, ParentType extends ResolversParentTypes['Server'] = ResolversParentTypes['Server']> = ResolversObject<{
  timezoneOffset?: Resolver<ResolversTypes['Float'], ParentType, ContextType>,
  systemAgents?: Resolver<Array<ResolversTypes['Agent']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  myProfile?: Resolver<ResolversTypes['Agent'], ParentType, ContextType>,
  myServer?: Resolver<ResolversTypes['Server'], ParentType, ContextType>,
  readDefinitions?: Resolver<Array<ResolversTypes['Entry']>, ParentType, ContextType, RequireFields<QueryReadDefinitionsArgs, 'groupId'>>,
  readEntries?: Resolver<Maybe<ResolversTypes['EntriesPage']>, ParentType, ContextType, RequireFields<QueryReadEntriesArgs, 'groupId'>>,
}>;

export type ActionResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['ActionResponse'] = ResolversParentTypes['ActionResponse']> = ResolversObject<{
  __resolveType: TypeResolveFn<'CreateSessionResponse' | 'SendResponse', ParentType, ContextType>,
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  errorMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
}>;

export type CreateSessionResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateSessionResponse'] = ResolversParentTypes['CreateSessionResponse']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  errorMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  jwt?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type SendResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['SendResponse'] = ResolversParentTypes['SendResponse']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  errorMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  createSession?: Resolver<ResolversTypes['CreateSessionResponse'], ParentType, ContextType>,
  send?: Resolver<Maybe<ResolversTypes['SendResponse']>, ParentType, ContextType, RequireFields<MutationSendArgs, 'event'>>,
}>;

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  event?: SubscriptionResolver<ResolversTypes['Json'], "event", ParentType, ContextType>,
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  DateTime?: GraphQLScalarType,
  Json?: GraphQLScalarType,
  EntriesPage?: EntriesPageResolvers<ContextType>,
  Agent?: AgentResolvers<ContextType>,
  Membership?: MembershipResolvers<ContextType>,
  Group?: GroupResolvers<ContextType>,
  Entry?: EntryResolvers<ContextType>,
  Server?: ServerResolvers<ContextType>,
  Query?: QueryResolvers<ContextType>,
  ActionResponse?: ActionResponseResolvers,
  CreateSessionResponse?: CreateSessionResponseResolvers<ContextType>,
  SendResponse?: SendResponseResolvers<ContextType>,
  Mutation?: MutationResolvers<ContextType>,
  Subscription?: SubscriptionResolvers<ContextType>,
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
