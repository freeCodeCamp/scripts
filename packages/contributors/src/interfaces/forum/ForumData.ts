export interface ForumData {
  directory_items: {
    id: number;
    likes_received: number;
    likes_given: number;
    topics_entered: number;
    topic_count: number;
    post_count: number;
    posts_read: number;
    days_visited: number;
    user: {
      id: number;
      username: string;
      name: string;
      avatar_template: string;
      title: string;
      primary_group_name?: string;
      primary_group_flair_url?: string;
      primary_group_flair_bg_color?: string;
      primary_group_flair_color?: string;
    };
  }[];
  meta: {
    last_updated_at: string;
    total_rows_directory_items: number;
    load_more_directory_items?: string;
  };
}
