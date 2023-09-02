import MainHeader from '@/components/header/main-header';

export default function Home() {
  return (
    <>
      <MainHeader description="since 2018" />
      <main className="base-main">
        <div className="bg-white dark:bg-slate-800 p-5 drop-shadow-md rounded-lg">
          <div className="flex flex-wrap gap-2">
            {[
              'Fullstack Web Developer',
              'Devops',
              'CI/CD',
              'Web Application',
              'Database Designer',
              'Network Security',
              'System Administrator',
              'Server Administrator',
              'Network Administrator',
              'Web Server Administrator',
              'Server Security',
              'Web Server Security',
              'Application Security',
              'Application Penetration Testing',
              'Application Development',
              'Web Development',
              'Web Design',
              'QA Engineer',
              'Analyst',
              'Automation Engineer',
              'Containerization',
            ].map((item, i) => (
              <span key={i} className="bg-primary/5 px-4 py-2 rounded-lg">
                {item}
              </span>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
