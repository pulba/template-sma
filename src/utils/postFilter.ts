/**
 * src/utils/postFilter.ts
 * Utility to filter posts based on their status and publish date
 */

export function getVisiblePosts(posts: any[]) {
    const now = new Date();

    return posts.filter((post) => {
        // Default to 'published' if status is missing (backward compatibility)
        const status = post.data?.status || 'published';

        // Takedown posts are never visible
        if (status === 'takedown') {
            return false;
        }

        // Draft posts are not visible (could be visible in dev mode, but hiding it generally for safety)
        if (status === 'draft') {
            // Optional: if (import.meta.env.DEV) return true;
            return false;
        }

        // Scheduled posts are only visible if their publish date has passed
        if (status === 'scheduled') {
            const pubDate = post.data?.pubdate ? new Date(post.data.pubdate) : null;
            if (!pubDate) return false; // If scheduled but no date, don't show
            return pubDate <= now;
        }

        // Published posts are always visible
        return status === 'published';
    });
}
