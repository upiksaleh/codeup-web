import MainHeader from '@/components/header/main-header';

export default function Home() {
  return (
    <>
      <MainHeader description="since 2018" />
      <main className="base-main">
        <div className="bg-white dark:bg-slate-800 p-5 drop-shadow-md rounded-lg">
          <h3 className="font-bold">Postingan Terbaru</h3>
        </div>
      </main>
    </>
  );
}
