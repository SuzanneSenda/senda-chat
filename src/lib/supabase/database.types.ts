export type UserRole = 'supervisor' | 'admin' | 'voluntario'
export type UserStatus = 'pending' | 'active' | 'inactive'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  status: UserStatus
  avatar_url: string | null
  phone: string | null
  last_sign_in: string | null
  created_at: string
  updated_at: string
}

export interface ToolboxSection {
  id: string
  slug: string
  title: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ToolboxItem {
  id: string
  section_id: string
  title: string
  content: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  title: string
  content: string
  usage_hint: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MessageTag {
  id: string
  slug: string
  label: string
  sort_order: number
  created_at: string
}

export interface MessageTagRelation {
  message_id: string
  tag_id: string
}

export interface ResourceCategory {
  id: string
  slug: string
  title: string
  description: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Resource {
  id: string
  category_id: string
  title: string
  description: string | null
  resource_type: string
  contact: string | null
  link: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  phone: string
  started_at: string
  closed_at: string | null
  volunteer_id: string | null
  status: 'active' | 'closed' | 'pending'
  survey_score: number | null
  created_at: string
  updated_at: string
}

export interface ConversationMessage {
  id: string
  conversation_id: string
  from_user: boolean
  content: string
  created_at: string
}

export interface AppSettings {
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string }
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      toolbox_sections: {
        Row: ToolboxSection
        Insert: Omit<ToolboxSection, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<ToolboxSection, 'id' | 'created_at'>>
      }
      toolbox_items: {
        Row: ToolboxItem
        Insert: Omit<ToolboxItem, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<ToolboxItem, 'id' | 'created_at'>>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<Message, 'id' | 'created_at'>>
      }
      message_tags: {
        Row: MessageTag
        Insert: Omit<MessageTag, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<MessageTag, 'id' | 'created_at'>>
      }
      message_tag_relations: {
        Row: MessageTagRelation
        Insert: MessageTagRelation
        Update: Partial<MessageTagRelation>
      }
      resource_categories: {
        Row: ResourceCategory
        Insert: Omit<ResourceCategory, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<ResourceCategory, 'id' | 'created_at'>>
      }
      resources: {
        Row: Resource
        Insert: Omit<Resource, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<Resource, 'id' | 'created_at'>>
      }
      conversations: {
        Row: Conversation
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<Conversation, 'id' | 'created_at'>>
      }
      conversation_messages: {
        Row: ConversationMessage
        Insert: Omit<ConversationMessage, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<ConversationMessage, 'id' | 'created_at'>>
      }
      app_settings: {
        Row: AppSettings
        Insert: AppSettings
        Update: Partial<AppSettings>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      user_status: UserStatus
    }
  }
}
