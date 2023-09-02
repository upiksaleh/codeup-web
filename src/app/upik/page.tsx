import MainHeader from '@/components/header/main-header';
import { Mdx } from '@/components/mdx/mdx';
import { allBlogs } from 'contentlayer/generated';
import { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

const ListItem = ({ value }: { value: string[] }) => {
  return (
    <div className="bg-primary/5 p-3 flex flex-col gap-2 rounded-lg">
      <div>{value[0]}</div>
      <h3 className="font-medium leading-tight">{value[1]}</h3>
      <p className="">{value[2]}</p>
    </div>
  );
};
const ListWork = ({ value }: { value: string[] }) => {
  return (
    <div className="pl-4">
      <ol className="list-disc">
        {value.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
    </div>
  );
};

export async function generateMetadata({}): Promise<Metadata> {
  return {
    title: 'Abdul Rahman Saleh [upik]',
  };
}

export default function ProfilPage() {
  const contacts = [
    { label: 'Email', value: 'upxsal@gmail.com' },
    { label: 'Location', value: 'Sulawesi Utara, Indonesia' },
    { label: 'Age', value: new Date().getFullYear() - 1994 },
  ];
  return (
    <>
      <MainHeader
        title="Abdul Rahman Saleh [upik]"
        description="Fullstack Web Developer"
      />
      <main className="base-main mb-20">
        <div className="grid grid-cols-12 gap-6 md:gap-10 justify-between mt-[100px]">
          <div className="col-span-12 lg:col-span-4 lg:block h-[400px] w-full bg-white rounded-[20px] ">
            <div className="relative bg-white w-full ">
              <div className="absolute w-full  -mt-[90px]">
                <Image
                  src="/images/upik.jpeg"
                  width={100}
                  height={100}
                  className="w-[200px] h-[220px] drop-shadow-xl mx-auto rounded-[20px]"
                  alt=""
                />
                <div className="flex flex-col gap-4 p-5">
                  {contacts.map((contact, i) => (
                    <div key={i} className="flex group">
                      <div className="text-left ml-2.5">
                        <p className="text-xs">{contact.label}</p>
                        <div className="break-all">
                          {contact.label === 'Email' ? (
                            <a
                              className="group-hover:text-primary duration-300 transition"
                              href="mailto:upik@codeup.id"
                            >
                              upik@codeup.id
                            </a>
                          ) : (
                            <span className="group-hover:text-primary duration-300 transition">
                              {contact.value}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[20px] col-span-12 lg:col-span-8 p-4">
            <div>
              <h2 className="text-2xl font-medium mb-3">Education</h2>
              <div className="flex flex-col gap-5">
                <ListItem
                  value={[
                    '2011-2018',
                    'Bachelor of Informatics Engineering',
                    'STATE UNIVERSITY OF GORONTALO',
                  ]}
                />
              </div>
            </div>
            <div className="mt-5">
              <h2 className="text-2xl font-medium mb-3">Experience</h2>
              <div className="flex flex-col gap-6">
                <div>
                  <ListItem
                    value={[
                      '06/2019 - Present',
                      'Experts',
                      'Diskominfo Bolsel',
                    ]}
                  />

                  <div className="pl-8">
                    <ListWork
                      value={[
                        'System security specialist',
                        'Full stack web developer',
                        'CI/CD',
                        'Devops',
                        'Sysadmin',
                        'Network admin',
                        'Containerization',
                      ]}
                    />
                  </div>
                </div>
                <div>
                  <ListItem
                    value={[
                      '2018 - Present',
                      'Full Stack Web Developer',
                      'CodeUP',
                    ]}
                  />
                  <div className="pl-8">
                    <p>
                      Start build web applications using popular frameworks.
                    </p>
                    <ListWork
                      value={[
                        'Start working with NodeJS, Typescript.',
                        'Start working with Symfony',
                        'Fix vulnerabilities on web (Freelancer)',
                        'Freelancer Full stack developer • other private projects...',
                      ]}
                    />
                  </div>
                </div>
                <div>
                  <ListItem
                    value={[
                      '2016 - 2018',
                      'Full Stack Web Developer',
                      'OrangeIT',
                    ]}
                  />
                  <div className="pl-8">
                    <p>
                      Build web applications using the CodeIgniter, Laravel,
                      Yii2 and Symfony frameworks.
                    </p>
                    <ListWork
                      value={[
                        'Build a hospital management information system.',
                        'Build custom framework using Yii2 framework.',
                        'Build custom framework using CodeIgniter.',
                        'Build custom framework using Laravel.',
                        'Building a web application for Gorontalo City official travel.',
                        'other private projects...',
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
