export interface Discourse {
  users: User[];
  primary_groups: PrimaryGroup[];
  flair_groups: FlairGroup[];
  topic_list: TopicList;
}

export interface User {
  id: number;
  username: string;
  name: string;
  avatar_template: string;
  flair_name: string;
  trust_level: number;
  primary_group_name: string;
  flair_url: string;
  flair_bg_color: string;
  flair_color: string;
  moderator?: boolean;
}

export interface PrimaryGroup {
  id: number;
  name: string;
}

export interface FlairGroup {
  id: number;
  name: string;
  flair_url: string;
  flair_bg_color: string;
  flair_color: string;
}

export interface Poster {
  extras: string;
  description: string;
  user_id: number;
  primary_group_id?: number;
  flair_group_id?: number;
}

export interface Topic {
  id: number;
  title: string;
  fancy_title: string;
  slug: string;
  posts_count: number;
  reply_count: number;
  highest_post_number: number;
  image_url: string;
  created_at: Date;
  last_posted_at: Date;
  bumped: boolean;
  bumped_at: Date;
  archetype: string;
  unseen: boolean;
  pinned: boolean;
  unpinned?: boolean;
  visible: boolean;
  closed: boolean;
  archived: boolean;
  bookmarked?: boolean;
  liked?: boolean;
  tags_descriptions: unknown;
  views: number;
  like_count: number;
  has_summary: boolean;
  last_poster_username: string;
  category_id: number;
  pinned_globally: boolean;
  featured_link?: string;
  has_accepted_answer: boolean;
  can_vote: boolean;
  posters: Poster[];
  last_read_post_number?: number;
  unread?: number;
  new_posts?: number;
  unread_posts?: number;
  notification_level?: number;
}

export interface TopicList {
  can_create_topic: boolean;
  more_topics_url: string;
  per_page: number;
  topics: Topic[];
}
