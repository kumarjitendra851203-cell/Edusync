/* ═══════════ DATA & CONSTANTS ═══════════ */
const state = {
  role: null, userName: 'Jitendra Kumar', userInitials: 'JK',
  classData: {}, hcLog: [],
  resources: [
    {id:1,subject:'Data Structures',title:'Chapter 3 – Binary Trees',type:'pdf',size:'1.8 MB',bookmarked:false},
    {id:2,subject:'Data Structures',title:'Tree Traversal Explained',type:'yt',bookmarked:true},
    {id:3,subject:'Operating Systems',title:'Process Scheduling PYQ 2023',type:'pyq',size:'890 KB',bookmarked:false},
    {id:4,subject:'DBMS',title:'Normalization Notes',type:'pdf',size:'2.1 MB',bookmarked:false},
    {id:5,subject:'Computer Networks',title:'OSI Model Assignment',type:'pdf',size:'540 KB',bookmarked:true},
    {id:6,subject:'Mathematics',title:'Calculus Chapter 5',type:'pdf',size:'3.2 MB',bookmarked:false},
    {id:7,subject:'Operating Systems',title:'Deadlock Examples',type:'yt',bookmarked:false},
    {id:8,subject:'DBMS',title:'SQL Practice Questions',type:'pyq',size:'1.1 MB',bookmarked:false},
  ],
  quizzes: [
    {id:1,title:'Mid-Sem: Data Structures',subject:'Data Structures',published:true,questions:[
      {q:'Which data structure uses LIFO?',options:['Queue','Stack','Tree','Heap'],correct:1},
      {q:'Time complexity of binary search?',options:['O(n)','O(n²)','O(log n)','O(1)'],correct:2},
      {q:'What is a complete binary tree?',options:['All nodes have 2 children','All levels full except last','Balanced tree','None'],correct:1},
      {q:'Which traversal gives sorted output from BST?',options:['Preorder','Postorder','Inorder','Level order'],correct:2},
    ]},
    {id:2,title:'Quick Test: OS Basics',subject:'Operating Systems',published:true,questions:[
      {q:'What does CPU scheduling decide?',options:['Memory allocation','Process execution order','File access','Network speed'],correct:1},
      {q:'Deadlock requires how many conditions?',options:['2','3','4','5'],correct:2},
    ]},
    {id:3,title:'DBMS Unit 2',subject:'DBMS',published:true,questions:[
      {q:'SQL stands for?',options:['Structured Query Language','Simple Query Language','Sequential Query','None'],correct:0},
      {q:'Primary key cannot be?',options:['Unique','Indexed','NULL','Integer'],correct:2},
    ]},
  ],
  placements: [
    {id:1,company:'Amazon',emoji:'🟠',role:'SDE / SDE Intern',package:'₹15–21 LPA',pkgN:18,skills:['Java','AWS','DSA'],cgpa:7.0,type:'On-Campus',tier:'high'},
    {id:2,company:'Cisco',emoji:'🔵',role:'Software Engineer',package:'₹10–18 LPA',pkgN:14,skills:['Networking','C++','Embedded'],cgpa:7.5,type:'On-Campus',tier:'high'},
    {id:3,company:'Deloitte',emoji:'🟢',role:'Analyst/Consultant',package:'₹7–12 LPA',pkgN:9,skills:['Python','Analytics','Consulting'],cgpa:7.0,type:'On-Campus',tier:'high'},
    {id:4,company:'Bajaj Finserv',emoji:'🔷',role:'Software Engineer',package:'₹10–12 LPA',pkgN:11,skills:['Java','FinTech','Spring Boot'],cgpa:7.5,type:'On-Campus',tier:'high'},
    {id:5,company:'Tejas Networks',emoji:'🟡',role:'Software Developer',package:'₹8–10 LPA',pkgN:9,skills:['C++','Networking'],cgpa:7.0,type:'On-Campus',tier:'high'},
    {id:6,company:'Accenture',emoji:'🟣',role:'Associate/ASE',package:'₹4.5–8 LPA',pkgN:6,skills:['Any Language','Cloud'],cgpa:6.5,type:'Mass Hiring',tier:'avg'},
    {id:7,company:'Cognizant',emoji:'🔵',role:'Programmer Analyst',package:'₹4–7 LPA',pkgN:5,skills:['Java','SQL','Testing'],cgpa:6.0,type:'Mass Hiring',tier:'avg'},
    {id:8,company:'IBM',emoji:'⚫',role:'Associate SWE',package:'₹4–7 LPA',pkgN:5,skills:['Cloud','AI','DevOps'],cgpa:6.5,type:'On-Campus',tier:'avg'},
    {id:9,company:'Capgemini',emoji:'🔷',role:'Analyst',package:'₹4–6.5 LPA',pkgN:5,skills:['Python','SAP','Agile'],cgpa:6.0,type:'Mass Hiring',tier:'avg'},
    {id:10,company:'Zensar',emoji:'🟤',role:'Engineer Trainee',package:'₹4–6 LPA',pkgN:5,skills:['Java','React'],cgpa:6.0,type:'On-Campus',tier:'avg'},
    {id:11,company:'TCS',emoji:'🔵',role:'Systems Engineer',package:'₹3–4 LPA',pkgN:3.5,skills:['Any Language','Communication'],cgpa:6.0,type:'Mass Hiring',tier:'mass'},
    {id:12,company:'Infosys',emoji:'🟢',role:'Systems Engineer',package:'₹3–4.5 LPA',pkgN:3.7,skills:['Java','Python','SQL'],cgpa:6.0,type:'Mass Hiring',tier:'mass'},
    {id:13,company:'Wipro',emoji:'🟡',role:'Project Engineer',package:'₹3–4 LPA',pkgN:3.5,skills:['Any Stack'],cgpa:6.0,type:'Mass Hiring',tier:'mass'},
    {id:14,company:'HCLTech',emoji:'🔵',role:'Graduate Engineer',package:'₹3–4 LPA',pkgN:3.5,skills:['Any Language','Aptitude'],cgpa:6.0,type:'Mass Hiring',tier:'mass'},
  ],
  studentResults: [], issuedBooks: [],
  currentQuiz: null, currentQIdx: 0, currentAnswers: [],
  currentPlacementTier: 'high',
  faceModel: null, detectionThreshold: 0.5, _alertFilter: 'all',
};

const CLASSES = {a:['A1','A2','A3','A4','A5'], b:['B1','B2','B3','B4','B5','B6']};

/* Demo-only credentials (client-side). Replace with real auth before production use. */
const USER_DB = {
  student: [
    { name:'Jitendra Kumar', email:'jitendra@sistec.ac.in', password:'jitendra@123' },
    { name:'Aditya Tiwari',  email:'aditya@sistec.ac.in',   password:'aditya@123' },
    { name:'Anuj Saru',      email:'anuj@sistec.ac.in',     password:'anuj@123' },
    { name:'Student User',   email:'student@sistec.ac.in',  password:'student@123' },
  ],
  teacher: [
    { name:'Prof. Rajesh Sharma', email:'rajesh@sistec.ac.in', password:'faculty@123' },
    { name:'Prof. Priya Mehta',   email:'priya@sistec.ac.in',  password:'priya@123' },
    { name:'Prof. Suresh Gupta',  email:'suresh@sistec.ac.in', password:'suresh@123' },
    { name:'Teacher User',        email:'teacher@sistec.ac.in',password:'teacher@123' },
  ]
};

const BUS_ROUTES = [
  {num:'24',name:'Narela Route',stops:[{t:'7:20',n:'Nizamuddin'},{t:'7:30',n:'Tanatan Dhaba'},{t:'7:35',n:'Narela Jod'},{t:'7:38',n:'Ayodhya Nagar'},{t:'7:44',n:'Green Valley'},{t:'8:15',n:'🏫 SISTec GN'}]},
  {num:'42/02/49',name:'Karond (3 Buses!)',badge:true,stops:[{t:'7:45',n:'Karond Chauraha'},{t:'7:50',n:'RGPV'},{t:'8:15',n:'🏫 SISTec GN'}]},
  {num:'06',name:'Neori Mandir Route',stops:[{t:'7:45',n:'Neori Mandir'},{t:'7:50',n:'Lalghati'},{t:'8:15',n:'🏫 SISTec GN'}]},
  {num:'11',name:'Chhola Road Route',stops:[{t:'7:05',n:'Chopda'},{t:'7:32',n:'Peoples Hospital'},{t:'7:35',n:'BMHRC'},{t:'8:15',n:'🏫 SISTec GN'}]},
  {num:'12',name:'Railway Station Route',stops:[{t:'7:00',n:'Coach Factory'},{t:'7:05',n:'Bhopal Railway Station'},{t:'7:15',n:'Nadra Bus Stop'},{t:'8:15',n:'🏫 SISTec GN'}]},
  {num:'28',name:'Katara / 5 No Stop',stops:[{t:'7:00',n:'Amaltas'},{t:'7:05',n:'Katara Chowki'},{t:'7:50',n:'5 No Stop'},{t:'8:15',n:'🏫 SISTec GN'}]},
  {num:'30',name:'Kolar Route',stops:[{t:'6:35',n:'Kajli Kheda'},{t:'7:00',n:'Bima Kunj'},{t:'7:15',n:'Chunabhatti'},{t:'8:15',n:'🏫 SISTec GN'}]},
  {num:'31',name:'Mandideep Route',stops:[{t:'6:30',n:'Satlapur'},{t:'6:58',n:'Ashima Mall'},{t:'7:30',n:'Board Office'},{t:'8:15',n:'🏫 SISTec GN'}]},
  {num:'18',name:'City Route',stops:[{t:'7:10',n:'Jyoti Talkies'},{t:'7:35',n:'Bharat Talkies'},{t:'7:55',n:'Idgah Hills'},{t:'8:15',n:'🏫 SISTec GN'}]},
  {num:'50',name:'Nariyal Kheda Route',stops:[{t:'7:35',n:'Bhopal Talkies'},{t:'7:45',n:'Nariyal Kheda'},{t:'8:15',n:'🏫 SISTec GN'}]},
];

const LIBRARY = {
  'Sem 1':{desc:'Engineering fundamentals — Maths, Physics, Chemistry',books:[
    {title:'Higher Engineering Mathematics',author:'B.S. Grewal',subj:'Maths I',icon:'📐',avail:3,total:5,tag:'Must Read'},
    {title:'Engineering Physics',author:'S.K. Sengar',subj:'Physics',icon:'⚛️',avail:2,total:4,tag:''},
    {title:'Engineering Chemistry',author:'Jain & Jain',subj:'Chemistry',icon:'🧪',avail:4,total:5,tag:''},
    {title:'Basic Electrical Engineering',author:'D.P. Kothari',subj:'BEE',icon:'⚡',avail:1,total:3,tag:'High Demand'},
    {title:'Engineering Graphics',author:'K.L. Narayana',subj:'EG',icon:'📏',avail:5,total:6,tag:''},
  ]},
  'Sem 2':{desc:'Applied sciences & electronics',books:[
    {title:'Higher Engineering Mathematics',author:'B.S. Grewal',subj:'Maths II',icon:'📐',avail:3,total:5,tag:'Must Read'},
    {title:'Engineering Mechanics',author:'Meriam & Kraige',subj:'Mechanics',icon:'⚙️',avail:2,total:4,tag:''},
    {title:'Basic Electronics',author:'B.L. Theraja',subj:'ECA',icon:'💡',avail:3,total:5,tag:''},
    {title:'Environmental Science',author:'R. Rajagopalan',subj:'ES',icon:'🌿',avail:7,total:8,tag:''},
  ]},
  'Sem 3':{desc:'Core CSE begins — DSA, OOP, DLD',books:[
    {title:'Data Structures using C',author:'Reema Thareja',subj:'DS',icon:'🌳',avail:2,total:6,tag:'High Demand'},
    {title:'Introduction to Algorithms',author:'CLRS (Cormen)',subj:'DS',icon:'🔢',avail:1,total:3,tag:'Must Read'},
    {title:'Digital Logic Design',author:'M. Morris Mano',subj:'DLD',icon:'🔌',avail:3,total:5,tag:''},
    {title:'OOP in Java',author:'E. Balagurusamy',subj:'Java',icon:'☕',avail:2,total:4,tag:'High Demand'},
    {title:'Computer Organization',author:'Carl Hamacher',subj:'COA',icon:'💻',avail:2,total:4,tag:''},
  ]},
  'Sem 4':{desc:'Algorithms, OS, DBMS, CN',books:[
    {title:'Algorithm Design',author:'Kleinberg & Tardos',subj:'Algorithms',icon:'🔍',avail:2,total:4,tag:'Must Read'},
    {title:'Database System Concepts',author:'Silberschatz',subj:'DBMS',icon:'🗄️',avail:1,total:4,tag:'High Demand'},
    {title:'Operating System Concepts',author:'Galvin (Dinosaur Book)',subj:'OS',icon:'🦕',avail:1,total:3,tag:'Must Read'},
    {title:'Computer Networks',author:'Andrew Tanenbaum',subj:'CN',icon:'🌐',avail:2,total:4,tag:'High Demand'},
    {title:'Theory of Automata',author:'Hopcroft & Ullman',subj:'TOC',icon:'🤖',avail:3,total:4,tag:''},
  ]},
  'Sem 5':{desc:'Web, Compiler, Software Engineering',books:[
    {title:'Software Engineering',author:'Roger Pressman',subj:'SE',icon:'🏗️',avail:3,total:5,tag:'Must Read'},
    {title:'Compiler Design',author:'Alfred V. Aho',subj:'CD',icon:'⚙️',avail:2,total:3,tag:''},
    {title:'Web Technologies',author:'Chris Bates',subj:'WT',icon:'🌐',avail:4,total:6,tag:''},
    {title:'Computer Graphics',author:'Foley, van Dam',subj:'CG',icon:'🎨',avail:3,total:4,tag:''},
  ]},
  'Sem 6':{desc:'AI, ML, Cloud & Information Security',books:[
    {title:'Artificial Intelligence',author:'Russell & Norvig',subj:'AI',icon:'🤖',avail:1,total:3,tag:'Must Read'},
    {title:'Machine Learning',author:'Tom Mitchell',subj:'ML',icon:'🧠',avail:1,total:2,tag:'High Demand'},
    {title:'Information Security',author:'William Stallings',subj:'IS',icon:'🔒',avail:3,total:4,tag:''},
    {title:'Cloud Computing',author:'Rajkumar Buyya',subj:'Cloud',icon:'☁️',avail:2,total:3,tag:''},
  ]},
  'Sem 7':{desc:'Electives — DL, IoT, Big Data',books:[
    {title:'Deep Learning',author:'Goodfellow et al.',subj:'DL',icon:'🧬',avail:1,total:2,tag:'High Demand'},
    {title:'Distributed Systems',author:'Tanenbaum',subj:'DS',icon:'🌍',avail:2,total:3,tag:''},
    {title:'Internet of Things',author:'Arshdeep Bahga',subj:'IoT',icon:'📡',avail:3,total:4,tag:''},
    {title:'Big Data Analytics',author:'Seema Acharya',subj:'BDA',icon:'📊',avail:2,total:3,tag:''},
  ]},
  'Sem 8':{desc:'Final semester — Projects & Placement prep',books:[
    {title:'Cracking the Coding Interview',author:'Gayle McDowell',subj:'Placement',icon:'💼',avail:1,total:3,tag:'Must Read'},
    {title:'System Design Interview',author:'Alex Xu',subj:'Placement',icon:'🏛️',avail:1,total:2,tag:'High Demand'},
    {title:'Clean Code',author:'Robert C. Martin',subj:'Best Practices',icon:'✨',avail:2,total:3,tag:'Must Read'},
    {title:'The Pragmatic Programmer',author:'Hunt & Thomas',subj:'Career',icon:'🎯',avail:2,total:3,tag:''},
  ]},
};

const AGENT_MODES = [
  {id:'interview',name:'Interview Coach',emoji:'💼',desc:'Mock technical interviews — DSA, OOP, HR rounds with real-time feedback',color:'var(--blue)',cta:'Start Interview',
   system:'You are a senior technical interviewer at a top tech company (Google/Amazon/TCS level). You are conducting a 1-on-1 mock interview for a CSE fresher. Ask ONE question at a time — mix DSA coding questions, OOP concepts, OS/DBMS basics, and behavioral HR questions. After each answer: (1) give specific feedback in 1-2 sentences (2) rate it briefly (3) ask the next question. Be professional but encouraging. Keep responses under 100 words.',
   starters:['Tell me about yourself','What is a Binary Search Tree?','Explain the difference between process and thread','Why do you want to join our company?']},
  {id:'debate',name:'Debate Partner',emoji:'⚔️',desc:'Practice argumentation & critical thinking by debating AI on any topic',color:'var(--red)',cta:'Start Debate',
   system:'You are an expert debate partner. The student will give their position on a topic. You ALWAYS take the opposing side and argue logically with facts and examples. After each exchange, briefly note one strength and one weakness of their argument, then counter. Be sharp, professional, and push their thinking. Keep each response under 80 words.',
   starters:['AI will replace programmers','Online education is better than offline','Remote work is the future','India should focus on coding education']},
  {id:'english',name:'English Coach',emoji:'🗣️',desc:'Improve fluency, grammar, pronunciation tips & professional vocabulary',color:'var(--teal)',cta:'Start Practice',
   system:'You are a friendly English communication coach for Indian engineering students. When the student writes anything: (1) gently correct any grammar mistakes (2) suggest a more professional/natural phrasing (3) give a short tip to improve (4) continue the conversation encouragingly. Focus on professional communication. Keep your responses warm and under 80 words.',
   starters:['I want to practice introducing myself','Help me write a professional email','How to speak confidently in meetings?','Correct my sentence: I am having good experience in coding']},
  {id:'gd',name:'Group Discussion',emoji:'👥',desc:'Placement GD simulation — practice structured arguments & time management',color:'var(--purple)',cta:'Start GD',
   system:'You are a GD moderator and fellow participant. Simulate a placement group discussion. Introduce a topic, then alternate between moderating and contributing viewpoints as other participants. After 3-4 exchanges, give the student a score out of 10 on: content, communication, listening, and leadership. Topics should be current tech/business/social. Keep each response under 80 words.',
   starters:['Start a GD on Social Media impact','Start GD: Work from home vs office','GD topic: AI in education','Start a GD on climate change']},
  {id:'resume',name:'Resume Review',emoji:'📄',desc:'Get AI feedback on your resume, skills, projects and application strategy',color:'var(--green)',cta:'Get Review',
   system:'You are a career counselor and expert resume reviewer for CSE students. The student will share their resume details, skills, or career questions. Give specific, actionable feedback. Suggest improvements, point out gaps, and recommend what to add. Be direct and practical. Keep responses under 100 words.',
   starters:['I have skills in Python, Java, and React. Review my profile','What projects should a Sem 3 CSE student build?','How to explain a gap in my resume?','I have 7.5 CGPA but no projects. What to do?']},
  {id:'aptitude',name:'Aptitude Trainer',emoji:'🧮',desc:'Practice quantitative aptitude, logical reasoning & verbal for placement tests',color:'var(--amber)',cta:'Start Practice',
   system:'You are an aptitude trainer for placement exam preparation. Ask ONE question at a time from: quantitative aptitude (time/work, profit/loss, percentages), logical reasoning, or verbal ability. After the student answers, tell them if it is correct, explain the solution briefly, and give the next question. Vary difficulty. Keep each response under 80 words.',
   starters:['Start with easy aptitude questions','Give me a logical reasoning question','Practice percentage problems','Start with verbal ability questions']},
];

/* Offline demo replies used when the AI backend is unavailable */
const DEMO_SETS = {
  interview:[
    `Good start! Let me give targeted feedback: structure your answer using **STAR** (Situation, Task, Action, Result). For technical questions, always state time complexity. ⏱️\n\nNext question: **What is the difference between a Stack and a Queue? Give a real-world example for each.**`,
    `That's a decent answer! One improvement: mention that Stack uses LIFO (e.g., browser back button) while Queue uses FIFO (e.g., print queue). Always give examples — it shows understanding. ✅\n\nNext: **Explain what happens when you type a URL in a browser — step by step.**`,
    `Nice! You covered the key steps. Add DNS resolution and TCP handshake to impress the interviewer. 🌐\n\nHR round: **Why do you want to work at a tech company? What excites you about software development?**`,
    `Great answer! Keep it authentic and mention specific technologies. Interviewers appreciate genuine passion. 👍\n\nCoding question: **Write pseudocode for reversing a linked list. What is the time and space complexity?**`,
    `Excellent thinking! O(n) time, O(1) space is correct. You're performing well — 4/5 so far. 🏆\n\nFinal question: **Describe a challenging problem you solved. What was your approach?**`,
  ],
  debate:[
    `Interesting position! But consider this counter-argument: **AI augments programmers, not replaces them.** Every new tool — from compilers to IDEs — was feared as a job killer. In reality, productivity rose and more developers were needed. Your move! 🎯`,
    `Strong point, but you're ignoring the **scale argument**: AI can now generate boilerplate, debug, and document code autonomously. Junior developer roles are already shrinking at some firms. Can creativity alone save the profession? ⚔️\n\n**Strength:** You cited historical patterns. **Weakness:** You underestimated pace of change.`,
    `You're improving your argument! However, "creativity" is increasingly automatable — AI already generates music, art, and design. **Rebuttal:** Creativity in coding means architecture decisions, which AI still struggles with. But for how long? 🤔`,
    `Fair concession! Let's push deeper: if AI handles 80% of coding tasks, what does the programmer of 2035 look like? Do they code at all, or become AI supervisors? Make your case! 💡`,
    `Excellent debate! **Your score: 7/10** — Good logic, strong examples, improved under pressure. Work on anticipating counter-arguments before they're raised. That's what wins GDs and debates. Well done! 🏅`,
  ],
  english:[
    `Good effort! Here's a polished version: **"I am a first-year Computer Science student at SISTec, passionate about software development and problem-solving."** 💡\n\nTip: Start professional introductions with your role/field, not your name — it's more impactful in formal settings. What would you like to practice next?`,
    `Nice improvement! One grammar note: use **"I have been working on"** instead of **"I am working since"** — this is the present perfect continuous tense for ongoing actions. 📝\n\nTry framing it again with this correction!`,
    `Much better! Your vocabulary is improving. Now let's work on **confidence phrases**: instead of "I think maybe", say "In my view" or "I believe". These phrases show conviction. Practice: describe your best project in 2 sentences!`,
    `Excellent! Your sentence structure is getting stronger. One tip: in professional emails, always end with a **clear call to action** — "Please let me know by Friday" instead of "Kindly revert". This reduces ambiguity. 🎯`,
    `You're progressing really well! Your communication score has improved from B to A- in this session. 🌟\n\nFinal tip: Read one English tech article daily (TechCrunch, Wired). It builds vocabulary naturally. Keep it up!`,
  ],
  gd:[
    `Welcome to today's GD! Topic: **"Should AI be taught as a mandatory subject in engineering colleges?"**\n\nThe round begins now. You have 90 seconds for your opening statement. Please share your position clearly. 🎙️`,
    `Good opening! You made a clear point. Now another "participant" weighs in: *"While AI education is valuable, making it mandatory may crowd out foundational subjects like Mathematics and Data Structures that are more universally applicable."*\n\nYour response? 💬`,
    `Strong counter! You held your ground well. **Evaluator's note:** Good content, moderate assertiveness. Try to include a **statistic or real-world example** to strengthen your point.\n\nNew participant: *"India's IT sector is already integrating AI — students without this knowledge will be uncompetitive globally."* Respond! ⚡`,
    `Excellent point about global competitiveness! You're dominating this discussion. 🔥\n\nModerator: Time check — 2 minutes remaining. Give your **conclusion statement** now. Summarise your position in 30 seconds.`,
    `**GD Complete! Your evaluation:**\n\n📊 Content: 8/10\n🗣️ Communication: 7/10\n👂 Listening: 7/10\n👑 Leadership: 8/10\n\n**Overall: 7.5/10** — Strong performance! You initiated well and held your ground under pressure. Work on citing examples more quickly. Ready for the next topic?`,
  ],
  resume:[
    `Thanks for sharing! Here's my assessment: For a fresher, your profile needs **3 things to stand out**: (1) 2 deployed projects on GitHub with README files, (2) at least one internship or hackathon participation, (3) a certification in Cloud or AI. Which of these would you like to work on first?`,
    `Great question about projects! For Sem 1-3, I recommend: **1) Student Grade Calculator** (shows OOP skills), **2) Bus Route Finder** (demonstrates data structures + UI), **3) Quiz App** (full stack — HTML/JS/local storage). All three are portfolio-worthy and SISTec-relevant! 🚀`,
    `For your LinkedIn headline, avoid: *"Student at SISTec"*. Instead use: **"CSE Student | Java & Python | Building projects in DSA & Web Dev | Open to Internships"**. This is keyword-rich and ATS-friendly. Your profile views will increase significantly. 📈`,
    `A 7.5 CGPA is solid! Companies like TCS, Infosys, and Wipro shortlist at 6.0+. For Amazon/Cisco, focus on DSA — solve 150+ LeetCode problems (Easy: 80, Medium: 60, Hard: 10). Pair that with 2 strong projects and your profile is competitive. 💪`,
    `Final advice: your profile in 6 months if you act now — **CGPA 7.5 + 2 GitHub projects + LeetCode 100 problems + one certification = shortlist at 70% of SISTec placement companies**. You're closer than you think! 🎓`,
  ],
  aptitude:[
    `Here's your first question! 🧮\n\n**Q: A train travels 60 km in 45 minutes. What is its speed in km/h?**\n\n(A) 60  (B) 75  (C) 80  (D) 90\n\nTake your time — show your working!`,
    `✅ **Correct! Answer: (C) 80 km/h**\nSolution: Speed = Distance/Time = 60 ÷ (45/60) = 60 × (60/45) = **80 km/h**\n\nNext question 🧠:\n**Q: If 12 men can complete a work in 8 days, how many days will 16 men take?**\n\n(A) 4  (B) 6  (C) 8  (D) 10`,
    `✅ **Correct! Answer: (B) 6 days**\nSolution: Men × Days = constant → 12×8 = 16×D → D = 96/16 = **6 days**\n\nLogical Reasoning now! 🔢:\n**Q: Find the next number: 2, 6, 12, 20, 30, ?**\n\n(A) 40  (B) 42  (C) 44  (D) 46`,
    `✅ **Correct! Answer: (B) 42**\nPattern: differences are 4,6,8,10,12 → next is 30+12=**42**\n\nVerbal Ability ✍️:\n**Q: Choose the correct sentence:**\n(A) She don't like mangoes\n(B) She doesn't likes mangoes\n(C) She doesn't like mangoes\n(D) She not like mangoes`,
    `✅ **Correct! Answer: (C)**\nRule: With he/she/it, use **doesn't + base verb** (not "doesn't likes").\n\n🏆 **Session Score: 4/4 — Perfect!**\nYou're well prepared for TCS NQT and Infosys InfyTQ. Keep practising — aim for 50 questions daily! Ready for harder questions?`,
  ],
};

const IV_QUESTIONS = {
  hr:['Tell me about yourself and your background.','What are your key strengths and how do they apply to this role?','Where do you see yourself in 5 years?','Tell me about a challenge you faced and how you overcame it.','Why do you want to join our company?','How do you handle pressure and tight deadlines?','Describe your teamwork and leadership experience.','What motivates you to perform your best?'],
  tech:['Explain the difference between Stack and Queue with examples.','What is time complexity of Binary Search? Explain with example.','Explain OOP concepts: Encapsulation, Inheritance, Polymorphism.','What is a deadlock? How can it be prevented?','Explain the difference between SQL and NoSQL databases.','What is the difference between process and thread?','Explain REST API and its key principles.','What is recursion? Give an example of its use.'],
};

const FACE_QUESTIONS = [
  'Please introduce yourself and look directly at the camera.',
  'What is your greatest professional strength?',
  'Describe a time you worked in a team to achieve a goal.',
  'How do you handle criticism and feedback?',
  'Where do you see yourself in 5 years? Be confident!',
];

const ATT_DATA = [
  {subj:'Data Structures',code:'DS',pct:64,classes:32,attended:20,color:'var(--red)'},
  {subj:'Operating Systems',code:'OS',pct:77,classes:39,attended:30,color:'var(--amber)'},
  {subj:'DBMS',code:'DBMS',pct:82,classes:33,attended:27,color:'var(--green)'},
  {subj:'Computer Networks',code:'CN',pct:91,classes:22,attended:20,color:'var(--teal)'},
  {subj:'Mathematics III',code:'MATH',pct:91,classes:35,attended:32,color:'var(--teal)'},
  {subj:'Software Lab',code:'LAB',pct:75,classes:20,attended:15,color:'var(--amber)'},
];

const BUS_TRACKER_DATA = {
  '24':{name:'Bus 24 — Narela Route',stops:['Nizamuddin','Tanatan Dhaba','Narela Jod','Ayodhya Nagar','Green Valley','SISTec GN 🏫'],current:2,speed:34,eta:8},
  '42':{name:'Bus 42 — Karond Route',stops:['Karond Chauraha','RGPV','SISTec GN 🏫'],current:1,speed:42,eta:12},
  '06':{name:'Bus 06 — Neori Mandir',stops:['Neori Mandir','Lalghati','SISTec GN 🏫'],current:0,speed:30,eta:22},
  '11':{name:'Bus 11 — Chhola Road',stops:['Chopda','Peoples Hospital','BMHRC','SISTec GN 🏫'],current:1,speed:38,eta:15},
  '12':{name:'Bus 12 — Railway Station',stops:['Coach Factory','Bhopal Railway Station','Nadra Bus Stop','SISTec GN 🏫'],current:2,speed:28,eta:18},
  '28':{name:'Bus 28 — Katara',stops:['Amaltas','Katara Chowki','5 No Stop','SISTec GN 🏫'],current:1,speed:35,eta:14},
  '30':{name:'Bus 30 — Kolar Route',stops:['Kajli Kheda','Bima Kunj','Chunabhatti','SISTec GN 🏫'],current:0,speed:45,eta:25},
  '31':{name:'Bus 31 — Mandideep',stops:['Satlapur','Ashima Mall','Board Office','SISTec GN 🏫'],current:2,speed:52,eta:20},
  '18':{name:'Bus 18 — City Route',stops:['Jyoti Talkies','Bharat Talkies','Idgah Hills','SISTec GN 🏫'],current:1,speed:29,eta:16},
  '50':{name:'Bus 50 — Nariyal Kheda',stops:['Bhopal Talkies','Nariyal Kheda','SISTec GN 🏫'],current:0,speed:40,eta:10},
};

const PLACEMENT_ALERTS = [
  {id:1,company:'Amazon',emoji:'🟠',role:'SDE Intern + FTE',pkg:'₹15–21 LPA',cgpa:7.0,skills:['Java','DSA','AWS'],type:'drive',deadline:'Apr 30, 2026',urgency:'urgent',isNew:true,desc:'Amazon SDE hiring for 2026 batch. Coding test → 2 tech rounds → HR. Register by April 30!'},
  {id:2,company:'Cisco',emoji:'🔵',role:'Software Engineer',pkg:'₹10–18 LPA',cgpa:7.5,skills:['Networking','C++'],type:'drive',deadline:'May 5, 2026',urgency:'drive',isNew:true,desc:'Cisco campus drive for CSE/IT/ECE. Apply via placement cell portal.'},
  {id:3,company:'Accenture',emoji:'🟣',role:'Associate / ASE',pkg:'₹4.5–8 LPA',cgpa:6.5,skills:['Any Language','Communication'],type:'drive',deadline:'May 12, 2026',urgency:'drive',isNew:true,desc:'Accenture mass recruitment drive. Online test followed by interview.'},
  {id:4,company:'Microsoft',emoji:'🪟',role:'Research Intern',pkg:'₹60K/month',cgpa:8.0,skills:['ML','Python','Research'],type:'internship',deadline:'Apr 28, 2026',urgency:'urgent',isNew:false,desc:'Microsoft Research 3-month summer internship for top CSE students.'},
  {id:5,company:'TCS',emoji:'🔵',role:'Systems Engineer',pkg:'₹3.5–4 LPA',cgpa:6.0,skills:['Any Language','Aptitude'],type:'deadline',deadline:'May 20, 2026',urgency:'deadline',isNew:false,desc:'TCS National Qualifier Test (NQT) registration closing soon.'},
  {id:6,company:'Google',emoji:'🔴',role:'STEP Intern',pkg:'₹80K/month',cgpa:8.5,skills:['Algorithms','C++/Python'],type:'internship',deadline:'May 1, 2026',urgency:'urgent',isNew:false,desc:'Google STEP Internship for 3rd year students. Competitive — prepare well!'},
  {id:7,company:'Infosys',emoji:'🟢',role:'Systems Engineer',pkg:'₹3.6–4.5 LPA',cgpa:6.0,skills:['Java','Python','SQL'],type:'drive',deadline:'Jun 10, 2026',urgency:'drive',isNew:false,desc:'Infosys InfyTQ platform — complete assessment to qualify for drive.'},
  {id:8,company:'Deloitte',emoji:'🟢',role:'Analyst',pkg:'₹7–12 LPA',cgpa:7.0,skills:['Python','Analytics'],type:'deadline',deadline:'May 15, 2026',urgency:'deadline',isNew:false,desc:'Profile submission deadline for Deloitte campus hiring 2026.'},
];
