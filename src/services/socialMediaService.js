// Enhanced social media sharing service
// Provides comprehensive sharing options for all major social media platforms

export const socialMediaService = {
  // Get current page URL for sharing
  getCurrentUrl() {
    return window.location.href;
  },

  // Get post URL for sharing
  getPostUrl(postId) {
    return `${window.location.origin}/posts/${postId}`;
  },

  // Share to Facebook
  shareToFacebook(post) {
    const url = this.getPostUrl(post.id);
    const text = `${post.title} - ${post.excerpt}`;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    window.open(shareUrl, 'facebook-share', 'width=580,height=500,scrollbars=no,resizable=no');
  },

  // Share to Twitter/X
  shareToTwitter(post) {
    const url = this.getPostUrl(post.id);
    const text = `${post.title} - ${post.excerpt}`;
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, 'twitter-share', 'width=580,height=500,scrollbars=no,resizable=no');
  },

  // Share to LinkedIn
  shareToLinkedIn(post) {
    const url = this.getPostUrl(post.id);
    const title = post.title;
    const summary = post.excerpt;
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, 'linkedin-share', 'width=580,height=500,scrollbars=no,resizable=no');
  },

  // Share to WhatsApp
  shareToWhatsApp(post) {
    const url = this.getPostUrl(post.id);
    const text = `${post.title}\n${post.excerpt}\n\n${url}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  },

  // Share to Telegram
  shareToTelegram(post) {
    const url = this.getPostUrl(post.id);
    const text = `${post.title}\n${post.excerpt}\n\n${url}`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  },

  // Share to Reddit
  shareToReddit(post) {
    const url = this.getPostUrl(post.id);
    const title = post.title;
    const shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    window.open(shareUrl, 'reddit-share', 'width=580,height=500,scrollbars=no,resizable=no');
  },

  // Copy link to clipboard
  copyLink(post) {
    const url = this.getPostUrl(post.id);
    return navigator.clipboard.writeText(url).then(() => {
      return { success: true, message: 'Link copied to clipboard!' };
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return { success: true, message: 'Link copied to clipboard!' };
    });
  },

  // Native Web Share API (for mobile/PWA)
  nativeShare(post) {
    const url = this.getPostUrl(post.id);
    const text = `${post.title} - ${post.excerpt}`;

    if (navigator.share) {
      return navigator.share({
        title: post.title,
        text: text,
        url: url,
      });
    }
    throw new Error('Web Share API not supported');
  },

  // Get share count for a post (mock implementation - would need API integration)
  getShareCount(postId) {
    // This would typically call an API to get actual share counts
    // For now, return mock data
    return Promise.resolve({
      facebook: Math.floor(Math.random() * 50),
      twitter: Math.floor(Math.random() * 30),
      linkedin: Math.floor(Math.random() * 20),
      whatsapp: Math.floor(Math.random() * 100),
      total: Math.floor(Math.random() * 200)
    });
  },

  // Track share event (for analytics)
  trackShare(postId, platform) {
    // Send analytics data
    console.log(`Post ${postId} shared on ${platform}`);

    // Track via API
    fetch('/api/posts/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId,
        platform,
        userId: this.getCurrentUserId() || 'anonymous'
      })
    }).catch(error => {
      console.warn('Failed to track share:', error);
    });

    // Could integrate with Google Analytics, Mixpanel, etc.
    if (typeof gtag !== 'undefined') {
      gtag('event', 'share', {
        event_category: 'engagement',
        event_label: platform,
        post_id: postId
      });
    }
  },

  // Get current user ID (helper function)
  getCurrentUserId() {
    // This would typically get from auth context or localStorage
    return localStorage.getItem('currentUserId') || 'anonymous';
  },
};

// Enhanced like service with animations and better UX
export const likeService = {
  // Like a post with enhanced feedback
  async likePost(postId, userId = 'anonymous') {
    try {
      // Add visual feedback immediately (optimistic update)
      this.addLikeAnimation(postId);

      // Show like notification
      this.showLikeNotification();

      const result = await fetch('/api/posts/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: postId, userId }),
      });

      if (!result.ok) {
        throw new Error('Failed to like post');
      }

      return await result.json();
    } catch (error) {
      console.error('Error liking post:', error);
      this.removeLikeAnimation(postId);
      throw error;
    }
  },

  // Unlike a post
  async unlikePost(postId, userId = 'anonymous') {
    try {
      const result = await fetch('/api/posts/like', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: postId, userId }),
      });

      if (!result.ok) {
        throw new Error('Failed to unlike post');
      }

      return await result.json();
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  },

  // Add like animation to button
  addLikeAnimation(postId) {
    const likeButton = document.querySelector(`[data-post-id="${postId}"] .like-button`);
    if (likeButton) {
      likeButton.classList.add('liked', 'animate-like');

      // Add floating hearts animation
      this.createFloatingHearts(likeButton);

      setTimeout(() => {
        likeButton.classList.remove('animate-like');
      }, 600);
    }
  },

  // Remove like animation (for error rollback)
  removeLikeAnimation(postId) {
    const likeButton = document.querySelector(`[data-post-id="${postId}"] .like-button`);
    if (likeButton) {
      likeButton.classList.remove('liked', 'animate-like');
    }
  },

  // Create floating hearts animation
  createFloatingHearts(button) {
    const heartsContainer = document.createElement('div');
    heartsContainer.className = 'floating-hearts';
    heartsContainer.style.position = 'absolute';
    heartsContainer.style.pointerEvents = 'none';

    // Create multiple hearts
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const heart = document.createElement('span');
        heart.innerHTML = '❤️';
        heart.style.position = 'absolute';
        heart.style.fontSize = '20px';
        heart.style.left = Math.random() * 40 - 20 + 'px';
        heart.style.animation = `floatUp 1s ease-out forwards`;
        heartsContainer.appendChild(heart);

        setTimeout(() => {
          heart.remove();
        }, 1000);
      }, i * 100);
    }

    button.style.position = 'relative';
    button.appendChild(heartsContainer);

    setTimeout(() => {
      heartsContainer.remove();
    }, 1500);
  },

  // Show like notification
  showLikeNotification() {
    // Create a toast notification
    const notification = document.createElement('div');
    notification.className = 'like-notification';
    notification.innerHTML = '❤️ Liked!';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  },

  // Get like animation styles (to be added to CSS)
  getAnimationStyles() {
    return `
      @keyframes floatUp {
        0% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        100% {
          opacity: 0;
          transform: translateY(-100px) scale(1.5);
        }
      }

      @keyframes slideInRight {
        0% {
          opacity: 0;
          transform: translateX(100px);
        }
        100% {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideOutRight {
        0% {
          opacity: 1;
          transform: translateX(0);
        }
        100% {
          opacity: 0;
          transform: translateX(100px);
        }
      }

      .animate-like {
        animation: likePulse 0.6s ease-out;
      }

      @keyframes likePulse {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.2);
        }
        100% {
          transform: scale(1);
        }
      }

      .like-button.liked {
        color: #ef4444;
        animation: likeGlow 0.6s ease-out;
      }

      @keyframes likeGlow {
        0% {
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
        }
        50% {
          box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
        }
      }
    `;
  }
};
