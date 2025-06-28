const SKILL_DATABASE = {
  // Programming Languages
  technical: {
    'JavaScript': ['javascript', 'js', 'ecmascript', 'es6', 'es2015'],
    'Python': ['python', 'py', 'python3'],
    'Java': ['java', 'jdk', 'jvm'],
    'TypeScript': ['typescript', 'ts'],
    'C++': ['c++', 'cpp', 'cplusplus'],
    'C#': ['c#', 'csharp', 'c-sharp'],
    'PHP': ['php'],
    'Ruby': ['ruby', 'rb'],
    'Go': ['golang', 'go'],
    'Rust': ['rust'],
    'Swift': ['swift'],
    'Kotlin': ['kotlin'],
    'Scala': ['scala'],
    'R': ['r programming', 'r language'],
    'MATLAB': ['matlab'],
    
    // Frontend Frameworks
    'React': ['react', 'reactjs', 'react.js'],
    'Angular': ['angular', 'angularjs'],
    'Vue.js': ['vue', 'vuejs', 'vue.js'],
    'HTML': ['html', 'html5'],
    'CSS': ['css', 'css3'],
    'Bootstrap': ['bootstrap'],
    'Tailwind': ['tailwind', 'tailwindcss'],
    'jQuery': ['jquery'],
    'Sass': ['sass', 'scss'],
    'LESS': ['less'],
    
    // Backend Frameworks
    'Node.js': ['node', 'nodejs', 'node.js'],
    'Express': ['express', 'expressjs'],
    'Django': ['django'],
    'Flask': ['flask'],
    'Spring': ['spring boot', 'spring framework'],
    'Laravel': ['laravel'],
    'Ruby on Rails': ['rails', 'ruby on rails'],
    'ASP.NET': ['asp.net', 'aspnet'],
    'FastAPI': ['fastapi'],
    
    // Databases
    'MongoDB': ['mongodb', 'mongo'],
    'MySQL': ['mysql'],
    'PostgreSQL': ['postgresql', 'postgres'],
    'SQLite': ['sqlite'],
    'Redis': ['redis'],
    'Cassandra': ['cassandra'],
    'Oracle': ['oracle database'],
    'SQL Server': ['sql server', 'mssql'],
    'SQL': ['sql', 'structured query language']
  },
  
  tool: {
    'Git': ['git', 'version control'],
    'GitHub': ['github'],
    'GitLab': ['gitlab'],
    'Docker': ['docker', 'containerization'],
    'Kubernetes': ['kubernetes', 'k8s'],
    'Jenkins': ['jenkins', 'ci/cd'],
    'Webpack': ['webpack'],
    'VS Code': ['vscode', 'visual studio code'],
    'IntelliJ': ['intellij', 'intellij idea'],
    'Postman': ['postman'],
    'Figma': ['figma'],
    'Jira': ['jira'],
    'Slack': ['slack']
  },
  
  cloud: {
    'AWS': ['aws', 'amazon web services'],
    'Azure': ['azure', 'microsoft azure'],
    'Google Cloud': ['gcp', 'google cloud platform', 'google cloud'],
    'Firebase': ['firebase'],
    'Heroku': ['heroku'],
    'Netlify': ['netlify'],
    'Vercel': ['vercel']
  },
  
  'non-technical': {
    'Leadership': ['leadership', 'team lead', 'managing teams'],
    'Communication': ['communication', 'presentation skills'],
    'Project Management': ['project management', 'agile', 'scrum'],
    'Problem Solving': ['problem solving', 'analytical thinking'],
    'Teamwork': ['teamwork', 'collaboration', 'team player'],
    'Time Management': ['time management', 'multitasking'],
    'Critical Thinking': ['critical thinking', 'decision making']
  }
};


const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const extractSkills = (resumeText) => {
    if (!resumeText || typeof resumeText !== "string") {
        return { skills: [], categorizedSkills: {}, confidence: 0 };
    }


    const text = resumeText.toLowerCase();
    const foundSkills = new Set();
    let categorizedSkills = {};

    let totalAliases = 0;
    let matchedAliases = 0;

    for(const [category, skillsObj] of Object.entries(SKILL_DATABASE)){
        categorizedSkills[category] = [];

        for(const [skill, aliases] of Object.entries(skillsObj)){
            totalAliases += aliases.length;

            for(const alias of aliases){
                const pattern = new RegExp(`\\b${alias.toLowerCase()}\\b`, 'i'); // word boundary
                if(pattern.test(text)){
                    foundSkills.add(skill);
                    categorizedSkills[category].push(skill);
                    matchedAliases++;
                    break;
                }
            }
        }

        if(categorizedSkills[category].length == 0){
            delete categorizedSkills[category]
        } else{
            categorizedSkills[category] = [...new Set(categorizedSkills[category])];
        }

        
    }
     const confidence = matchedAliases / totalAliases;



    
    return {
        skills: Array.from(foundSkills),
        categorizedSkills,
        confidence: Math.round(confidence * 100) / 100
    };

};

export {extractSkills}

