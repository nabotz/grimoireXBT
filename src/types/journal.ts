export type JournalMood = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

export interface JournalEntry {
  id: string;
  user_id: string;
  title?: string;
  content: string; // markdown supported
  mood?: JournalMood;
  tags?: string[];
  created_at: string;
  updated_at: string;
}
