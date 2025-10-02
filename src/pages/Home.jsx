import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookOpen, Users, Award, Lightbulb, ArrowRight, CheckCircle, Heart, MessageCircle, Image as ImageIcon, Video } from 'lucide-react';
import { getVisiblePosts } from '../services/postsService';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await getVisiblePosts();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  return (
    <div className="home">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title fade-in">Welcome to Kiyumba Technical School</h1>
          <p className="hero-subtitle fade-in">
            Transform your future with professional technical education. Learn Software Development, 
            Fashion Design, Building Construction, or Wood Technology at levels L3, L4, and L5.
          </p>
          <div className="hero-buttons fade-in">
            <Link to="/register" className="btn btn-primary btn-large">
              Apply Now
              <ArrowRight size={20} />
            </Link>
            <Link to="/about" className="btn btn-outline btn-large">
              Learn More
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-image-placeholder">
            <BookOpen size={120} strokeWidth={1} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Kiyumba?</h2>
          <p className="section-subtitle">
            We provide world-class education with a focus on holistic development
          </p>

          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon">
                <BookOpen size={40} />
              </div>
              <h3>Quality Education</h3>
              <p>
                Comprehensive curriculum designed to meet international standards 
                and prepare students for global opportunities.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <Users size={40} />
              </div>
              <h3>Expert Teachers</h3>
              <p>
                Highly qualified and dedicated educators committed to nurturing 
                each student's potential and academic excellence.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <Award size={40} />
              </div>
              <h3>Excellence Awards</h3>
              <p>
                Recognized for outstanding academic achievements and innovative 
                teaching methodologies across the region.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <Lightbulb size={40} />
              </div>
              <h3>Modern Facilities</h3>
              <p>
                State-of-the-art classrooms, laboratories, and technology to 
                enhance the learning experience for all students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3 className="stat-number">1500+</h3>
              <p className="stat-label">Active Students</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">120+</h3>
              <p className="stat-label">Qualified Teachers</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">95%</h3>
              <p className="stat-label">Success Rate</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">50+</h3>
              <p className="stat-label">Awards Won</p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="programs">
        <div className="container">
          <h2 className="section-title">Our Technical Programs</h2>
          <p className="section-subtitle">
            Professional technical education across levels L3, L4, and L5
          </p>

          <div className="programs-grid">
            <div className="program-card card">
              <h3>Software Development</h3>
              <ul className="program-features">
                <li><CheckCircle size={20} /> Web Development</li>
                <li><CheckCircle size={20} /> Mobile Apps</li>
                <li><CheckCircle size={20} /> Database Management</li>
                <li><CheckCircle size={20} /> Levels: L3, L4, L5</li>
              </ul>
              <Link to="/register" className="btn btn-outline">Apply Now</Link>
            </div>

            <div className="program-card card featured">
              <div className="featured-badge">Most Popular</div>
              <h3>Fashion & Design</h3>
              <ul className="program-features">
                <li><CheckCircle size={20} /> Pattern Making</li>
                <li><CheckCircle size={20} /> Garment Construction</li>
                <li><CheckCircle size={20} /> Fashion Illustration</li>
                <li><CheckCircle size={20} /> Levels: L3, L4, L5</li>
              </ul>
              <Link to="/register" className="btn btn-primary">Apply Now</Link>
            </div>

            <div className="program-card card">
              <h3>Building Construction</h3>
              <ul className="program-features">
                <li><CheckCircle size={20} /> Structural Design</li>
                <li><CheckCircle size={20} /> Construction Methods</li>
                <li><CheckCircle size={20} /> Site Management</li>
                <li><CheckCircle size={20} /> Levels: L3, L4, L5</li>
              </ul>
              <Link to="/register" className="btn btn-outline">Apply Now</Link>
            </div>

            <div className="program-card card">
              <h3>Wood Technology</h3>
              <ul className="program-features">
                <li><CheckCircle size={20} /> Carpentry Skills</li>
                <li><CheckCircle size={20} /> Furniture Design</li>
                <li><CheckCircle size={20} /> Wood Processing</li>
                <li><CheckCircle size={20} /> Levels: L3, L4, L5</li>
              </ul>
              <Link to="/register" className="btn btn-outline">Apply Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Section */}
      {posts.length > 0 && (
        <section className="posts-section-home">
          <div className="container">
            <h2 className="section-title">Latest News & Updates</h2>
            <p className="section-subtitle">
              Stay informed with the latest announcements and updates from Kiyumba
            </p>

            <div className="home-posts-grid">
              {posts.slice(0, 6).map(post => (
                <div key={post.id} className="home-post-card card">
                  {post.imageUrl && (
                    <div className="home-post-image">
                      <img src={post.imageUrl} alt={post.title} />
                    </div>
                  )}
                  
                  <div className="home-post-content">
                    <div className="home-post-type">
                      {post.type === 'image' && <ImageIcon size={16} />}
                      {post.type === 'video' && <Video size={16} />}
                      <span>{post.type}</span>
                    </div>
                    
                    <h3 style={{ fontSize: post.textSize === 'small' ? '1rem' : post.textSize === 'large' ? '1.5rem' : '1.25rem' }}>
                      {post.title}
                    </h3>
                    
                    <p className="home-post-text" style={{ fontSize: post.textSize === 'small' ? '0.875rem' : post.textSize === 'large' ? '1.125rem' : '1rem' }}>
                      {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                    </p>
                    
                    <div className="home-post-meta">
                      <span className="post-date">
                        {new Date(post.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                      <div className="post-engagement">
                        <span>
                          <Heart size={16} />
                          {post.likes}
                        </span>
                        <span>
                          <MessageCircle size={16} />
                          {post.comments.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Join Kiyumba Technical School?</h2>
            <p>
              Start your journey towards professional technical excellence. 
              Apply now and transform your future with hands-on training.
            </p>
            <Link to="/register" className="btn btn-primary btn-large">
              Apply Now
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
      {/* Posts Section - published by admin */}
      <section className="posts-home-section">
        <div className="container">
          <h2 className="section-title">Latest Posts</h2>
          {posts.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            <div className="home-posts-grid">
              {posts.map(post => (
                <article key={post.id} className="home-post card">
                  <h3>{post.title}</h3>
                  <p className="post-meta">By {post.author} • {new Date(post.date).toLocaleDateString()}</p>
                  <p style={{ fontSize: post.textSize === 'small' ? '14px' : post.textSize === 'large' ? '18px' : '16px' }}>{post.content}</p>
                  {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="home-post-image" />}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
