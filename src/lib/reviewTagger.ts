import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface ReviewTaggingResult {
  topic: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
  priority: 'high' | 'medium' | 'low';
  priorityScore: number;
}

export interface AddReviewParams {
  customerId: string;
  sourceId: string;
  reviewText: string;
  state?: string;
  region?: string;
}

export async function tagReview(reviewText: string): Promise<ReviewTaggingResult> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tag-review`;

  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.access_token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.session.access_token}`,
    },
    body: JSON.stringify({ reviewText }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to tag review');
  }

  return response.json();
}

export async function addTaggedReview(params: AddReviewParams): Promise<string> {
  const { customerId, sourceId, reviewText, state, region } = params;

  try {
    const taggingResult = await tagReview(reviewText);

    const { data, error } = await supabase.rpc('add_tagged_review', {
      p_customer_id: customerId,
      p_source_id: sourceId,
      p_review_text: reviewText,
      p_sentiment: taggingResult.sentiment,
      p_summary: taggingResult.summary,
      p_priority_score: taggingResult.priorityScore,
      p_topics: [taggingResult.topic],
      p_state: state,
      p_region: region,
    });

    if (error) {
      throw error;
    }

    return data as string;
  } catch (error) {
    console.error('Error adding tagged review:', error);
    throw error;
  }
}

export async function batchTagReviews(
  reviews: AddReviewParams[]
): Promise<Array<{ success: boolean; reviewId?: string; error?: string }>> {
  const results = [];

  for (const review of reviews) {
    try {
      const reviewId = await addTaggedReview(review);
      results.push({ success: true, reviewId });
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}
