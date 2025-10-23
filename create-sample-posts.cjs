const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function createSamplePosts() {
  try {
    // Sample posts data
    const samplePosts = [
      {
        title: "Welcome to Kiyumba School",
        content: "We are excited to welcome all students to the new academic year at Kiyumba School. Our dedicated teachers and staff are committed to providing the best education possible.",
        type: "blog",
        imageUrl: null,
        videoUrl: null,
        textSize: "medium",
        visible: true,
        author: "Admin"
      },
      {
        title: "New Computer Lab Opening",
        content: "Our brand new computer lab is now open! Students can now access the latest technology for their studies and projects.",
        type: "blog",
        imageUrl: null,
        videoUrl: null,
        textSize: "medium",
        visible: true,
        author: "Admin"
      },
      {
        title: "Student Achievements",
        content: "Congratulations to our students who excelled in the recent inter-school competitions. Your hard work and dedication inspire us all!",
        type: "blog",
        imageUrl: null,
        videoUrl: null,
        textSize: "medium",
        visible: true,
        author: "Admin"
      }
    ];

    for (const post of samplePosts) {
      await sql`
        INSERT INTO posts (
          title,
          content,
          type,
          image_url,
          video_url,
          text_size,
          visible,
          author,
          created_at
        )
        VALUES (
          ${post.title},
          ${post.content},
          ${post.type},
          ${post.imageUrl},
          ${post.videoUrl},
          ${post.textSize},
          ${post.visible},
          ${post.author},
          NOW()
        )
      `;
      console.log(`Created post: ${post.title}`);
    }

    console.log('Sample posts created successfully!');
  } catch (error) {
    console.error('Error creating sample posts:', error);
  }
}

createSamplePosts();
