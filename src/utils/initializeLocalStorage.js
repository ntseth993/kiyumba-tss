// Initialize localStorage with sample data for development
const initializeLocalStorage = () => {
  // Only initialize if using localStorage mode
  if (import.meta.env.VITE_USE_LOCAL_STORAGE === 'true') {
    // Initialize posts if not exists
    if (!localStorage.getItem('posts')) {
      const samplePosts = [
        {
          id: '1',
          title: 'Welcome to Kiyumba Technical School',
          content: 'We are excited to welcome all our new and returning students to another great academic year. Our programs in Software Development, Fashion Design, Building Construction, and Wood Technology are designed to provide you with the skills needed for success in today\'s competitive job market.',
          excerpt: 'We are excited to welcome all our new and returning students to another great academic year.',
          type: 'announcement',
          imageUrl: '',
          videoUrl: '',
          textSize: 'medium',
          author: 'School Administration',
          date: new Date().toISOString(),
          likes: 25,
          comments: [],
          visible: true,
          likedBy: [],
          viewedBy: [],
          views: 150
        },
        {
          id: '2',
          title: 'Registration Now Open for L4 & L5 Programs',
          content: 'Registration is now open for Level 4 and Level 5 programs. Don\'t miss your chance to advance your technical skills. Apply online or visit our admissions office today.',
          excerpt: 'Registration is now open for Level 4 and Level 5 programs. Apply online today.',
          type: 'announcement',
          imageUrl: '',
          videoUrl: '',
          textSize: 'medium',
          author: 'Admissions Office',
          date: new Date(Date.now() - 86400000).toISOString(),
          likes: 12,
          comments: [],
          visible: true,
          likedBy: [],
          viewedBy: [],
          views: 89
        },
        {
          id: '3',
          title: 'New Industry Partnerships Announced',
          content: 'We are proud to announce new partnerships with leading companies in the tech and construction sectors. These partnerships will provide our students with valuable internship opportunities and real-world experience.',
          excerpt: 'We are proud to announce new partnerships with leading companies in tech and construction.',
          type: 'news',
          imageUrl: '',
          videoUrl: '',
          textSize: 'medium',
          author: 'Industry Relations',
          date: new Date(Date.now() - 172800000).toISOString(),
          likes: 18,
          comments: [],
          visible: true,
          likedBy: [],
          viewedBy: [],
          views: 67
        }
      ];
      localStorage.setItem('posts', JSON.stringify(samplePosts));
    }

    // Initialize comments if not exists
    if (!localStorage.getItem('comments')) {
      const sampleComments = [
        {
          id: '1',
          postId: '1',
          text: 'Great to hear! Looking forward to an amazing year.',
          author: 'John Student',
          authorEmail: 'john@kiyumba.com',
          authorId: 'student1',
          createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        },
        {
          id: '2',
          postId: '1',
          text: 'The new programs sound exciting. When do classes start?',
          author: 'Mary Teacher',
          authorEmail: 'mary@kiyumba.com',
          authorId: 'teacher1',
          createdAt: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
        },
        {
          id: '3',
          postId: '2',
          text: 'Perfect timing! I was just about to register.',
          author: 'Peter Student',
          authorEmail: 'peter@kiyumba.com',
          authorId: 'student2',
          createdAt: new Date(Date.now() - 900000).toISOString() // 15 minutes ago
        }
      ];
      localStorage.setItem('comments', JSON.stringify(sampleComments));
    }

    // Create sample base64 images for testing
    const createSampleImage = (text, color) => {
      const svg = `
        <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="200" fill="${color}"/>
          <text x="200" y="100" font-family="Arial" font-size="16" fill="white" text-anchor="middle">${text}</text>
        </svg>
      `;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    };

    // Initialize announcements if not exists
    if (!localStorage.getItem('announcements')) {
      const sampleAnnouncements = [
        {
          id: '1',
          title: 'New Student Registration Open',
          message: 'Registration for the new academic year is now open. Visit the admissions office or apply online.',
          priority: 'high',
          targetAudience: 'all',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          views: 45
        },
        {
          id: '2',
          title: 'Library Hours Extended',
          message: 'The school library will now be open until 8 PM on weekdays to support student study needs.',
          priority: 'medium',
          targetAudience: 'students',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          views: 23
        }
      ];
      localStorage.setItem('announcements', JSON.stringify(sampleAnnouncements));
    }

    // Initialize notifications if not exists
    if (!localStorage.getItem('schoolNotifications')) {
      const sampleNotifications = [
        {
          id: '1',
          title: 'Registration Deadline Extended',
          message: 'L5 program registration deadline has been extended to November 30th. Don\'t miss your chance!',
          priority: 'high',
          targetAudience: 'all',
          actionUrl: '/register',
          actionText: 'Register Now',
          imageUrl: createSampleImage('Registration Deadline', '#ef4444'),
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          views: 45
        },
        {
          id: '2',
          title: 'New Scholarship Opportunities',
          message: 'Applications are now open for the 2024 Technical Excellence Scholarships. Apply before December 15th.',
          priority: 'medium',
          targetAudience: 'students',
          actionUrl: '/scholarships',
          actionText: 'View Details',
          imageUrl: createSampleImage('Scholarships', '#8b5cf6'),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          views: 32
        }
      ];
      localStorage.setItem('schoolNotifications', JSON.stringify(sampleNotifications));
    }

    // Initialize events if not exists
    if (!localStorage.getItem('schoolEvents')) {
      const sampleEvents = [
        {
          id: '1',
          title: 'Final Exam Week',
          description: 'End-of-semester examinations for all programs',
          date: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
          time: '08:00',
          location: 'Multiple Locations',
          eventType: 'academic',
          targetAudience: 'all',
          featured: true,
          imageUrl: createSampleImage('Final Exam Week', '#3b82f6'),
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Industry Day',
          description: 'Meet with industry professionals and explore career opportunities',
          date: new Date(Date.now() + 86400000 * 22).toISOString().split('T')[0],
          time: '10:00',
          location: 'Main Auditorium',
          eventType: 'career',
          targetAudience: 'students',
          featured: false,
          imageUrl: createSampleImage('Industry Day', '#10b981'),
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('schoolEvents', JSON.stringify(sampleEvents));
    }

    // Initialize highlights if not exists
    if (!localStorage.getItem('schoolHighlights')) {
      const sampleHighlights = [
        {
          id: '1',
          title: 'Outstanding Student Performance',
          description: 'Congratulations to Sarah from Software Development L4 for achieving the highest GPA this semester!',
          category: 'achievement',
          imageUrl: createSampleImage('Student Achievement', '#10b981'),
          date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Teacher Excellence Award',
          description: 'Mr. Johnson recognized for innovative teaching methods in Building Construction program.',
          category: 'recognition',
          imageUrl: createSampleImage('Teacher Award', '#3b82f6'),
          date: new Date(Date.now() - 86400000 * 15).toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('schoolHighlights', JSON.stringify(sampleHighlights));
    }

    // Initialize users if not exists (for auth fallback)
    if (!localStorage.getItem('users')) {
      const demoUsers = [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@kiyumba.com',
          password: 'admin123',
          role: 'admin',
          avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=4F46E5&color=fff',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Staff Member',
          email: 'staff@kiyumba.com',
          password: 'staff123',
          role: 'staff',
          avatar: 'https://ui-avatars.com/api/?name=Staff+Member&background=10B981&color=fff',
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Teacher User',
          email: 'teacher@kiyumba.com',
          password: 'teacher123',
          role: 'teacher',
          avatar: 'https://ui-avatars.com/api/?name=Teacher+User&background=F59E0B&color=fff',
          createdAt: new Date().toISOString()
        },
        {
          id: 4,
          name: 'Student User',
          email: 'student@kiyumba.com',
          password: 'student123',
          role: 'student',
          avatar: 'https://ui-avatars.com/api/?name=Student+User&background=EF4444&color=fff',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('users', JSON.stringify(demoUsers));
    }

    console.log('✅ localStorage initialized with sample data');
  }
};

// Initialize localStorage when module loads
initializeLocalStorage();

export default initializeLocalStorage;
