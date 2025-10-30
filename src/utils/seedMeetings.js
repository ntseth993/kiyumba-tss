// Seed script to populate meetings data
const generateSampleMeetings = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  const sampleMeetings = [
    {
      id: '1',
      title: 'Weekly Staff Coordination Meeting',
      description: 'Review weekly progress, discuss upcoming events, and align on school priorities. Agenda includes: curriculum updates, facility maintenance, and upcoming parent-teacher conferences.',
      scheduledTime: tomorrow.toISOString(),
      duration: 60,
      platform: 'zoom',
      meetingType: 'administrative',
      hostId: 'admin1',
      hostName: 'Sarah Johnson',
      hostEmail: 'sarah.johnson@school.com',
      participants: ['teacher1', 'teacher2', 'staff1'],
      status: 'scheduled',
      maxParticipants: 50,
      settings: {
        recording: true,
        waitingRoom: true,
        joinBeforeHost: false,
        muteUponEntry: true
      },
      createdAt: now.toISOString(),
      joinUrl: 'https://zoom.us/j/123456789'
    },
    {
      id: '2',
      title: 'Parent-Teacher Conference - Grade 10',
      description: 'Quarterly meeting to discuss student progress, academic performance, and address parent concerns. Individual time slots will be allocated.',
      scheduledTime: nextWeek.toISOString(),
      duration: 180,
      platform: 'teams',
      meetingType: 'parent-teacher',
      hostId: 'teacher1',
      hostName: 'John Smith',
      hostEmail: 'john.smith@school.com',
      participants: [],
      status: 'scheduled',
      maxParticipants: 100,
      settings: {
        recording: false,
        waitingRoom: true,
        joinBeforeHost: false,
        muteUponEntry: true
      },
      createdAt: now.toISOString(),
      joinUrl: 'https://teams.microsoft.com/l/meetup-join/abc123'
    },
    {
      id: '3',
      title: 'Emergency Response Team Training',
      description: 'Mandatory safety training session for all staff members. Topics: emergency protocols, first aid refresher, and evacuation procedures.',
      scheduledTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 120,
      platform: 'zoom',
      meetingType: 'training',
      hostId: 'safety1',
      hostName: 'Robert Chen',
      hostEmail: 'robert.chen@school.com',
      participants: ['staff1', 'staff2', 'teacher1', 'teacher2'],
      status: 'scheduled',
      maxParticipants: 75,
      settings: {
        recording: true,
        waitingRoom: false,
        joinBeforeHost: true,
        muteUponEntry: false
      },
      createdAt: now.toISOString(),
      joinUrl: 'https://zoom.us/j/987654321'
    },
    {
      id: '4',
      title: 'Student Council Meeting',
      description: 'Monthly student council assembly to discuss upcoming events, student initiatives, and address student body concerns.',
      scheduledTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 45,
      platform: 'googleMeet',
      meetingType: 'student-group',
      hostId: 'teacher3',
      hostName: 'Emily Martinez',
      hostEmail: 'emily.martinez@school.com',
      participants: ['student1', 'student2', 'student3'],
      status: 'scheduled',
      maxParticipants: 30,
      settings: {
        recording: false,
        waitingRoom: true,
        joinBeforeHost: false,
        muteUponEntry: true
      },
      createdAt: now.toISOString(),
      joinUrl: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: '5',
      title: 'Curriculum Development Workshop',
      description: 'Collaborative session to review and update course materials for the upcoming semester. Focus on integrating technology and project-based learning.',
      scheduledTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 150,
      platform: 'zoom',
      meetingType: 'academic',
      hostId: 'academic1',
      hostName: 'David Wilson',
      hostEmail: 'david.wilson@school.com',
      participants: ['teacher1', 'teacher2', 'teacher3'],
      status: 'scheduled',
      maxParticipants: 40,
      settings: {
        recording: true,
        waitingRoom: true,
        joinBeforeHost: false,
        muteUponEntry: true
      },
      createdAt: now.toISOString(),
      joinUrl: 'https://zoom.us/j/456789123'
    }
  ];

  return sampleMeetings;
};

export const seedMeetings = () => {
  const meetings = generateSampleMeetings();
  localStorage.setItem('schoolMeetings', JSON.stringify(meetings));
  console.log('✅ Meetings seeded successfully:', meetings.length, 'meetings created');
  return meetings;
};

// You can run this directly in the browser console:
// import('/src/utils/seedMeetings.js').then(m => m.seedMeetings())