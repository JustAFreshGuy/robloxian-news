import { createClient } from '@sanity/client';
import { Suspense } from 'react';

const client = createClient({
  projectId: 'gwts12e8',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2026-10-10',
});

// 1. Separate component just for fetching the data
async function NewsList() {
  const query = `*[_type == "post"] | order(_createdAt desc) {
    _id,
    title,
    category,
    description,
    _createdAt,
    "imageUrl": mainImage.asset->url
  }`;

  const posts = await client.fetch(query, {}, { cache: 'no-store' });

  const getBadgeStyle = (category: string) => {
    switch (category) {
      case 'leak':
        return { text: 'Leak', classes: 'bg-red-500/10 text-red-400 border border-red-500/20' };
      case 'code':
        return { text: 'Promo Code', classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
      default:
        return { text: 'Update', classes: 'bg-[#00A2FF]/10 text-[#00A2FF] border border-[#00A2FF]/20' };
    }
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="w-full text-center py-20 border border-dashed border-[#242936] rounded-lg bg-[#161920]">
        <h3 className="text-lg font-bold text-[#94A3B8]">Waiting for incoming data logs...</h3>
        <p className="text-gray-500 text-sm mt-1">Publish an item in your Sanity studio to push it live.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {posts.map((post: any) => {
        const badge = getBadgeStyle(post.category);
        const postDate = new Date(post._createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });

        return (
          <div 
            key={post._id} 
            className="w-full bg-[#161920] border border-[#242936] rounded-xl p-5 flex items-center justify-between gap-8 shadow-md"
          >
            <div className="flex items-center gap-6 flex-1 min-w-0">
              {post.imageUrl ? (
                <img 
                  src={post.imageUrl} 
                  alt="" 
                  className="w-80 h-44 object-cover rounded-lg bg-[#0F1115] border border-[#242936] shrink-0 shadow-lg"
                />
              ) : (
                <div className="w-80 h-44 rounded-lg bg-[#0F1115] border border-[#242936] flex items-center justify-center shrink-0 text-5xl">
                  🎮
                </div>
              )}
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${badge.classes}`}>
                    {badge.text}
                  </span>
                  <span className="text-xs text-[#475569] font-mono">{postDate}</span>
                </div>
                
                <h3 className="text-2xl font-extrabold text-white mt-2 tracking-tight line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-base text-[#94A3B8] mt-1.5 line-clamp-3 leading-relaxed max-w-4xl">
                  {post.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 2. Main Page layout wraps the feed in a Suspense border to satisfy the compiler
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E2E8F0] font-sans selection:bg-[#00A2FF] selection:text-white">
      
      {/* NAVIGATION BAR */}
      <nav className="w-full bg-[#161920] border-b border-[#242936] px-8 py-4 sticky top-0 z-50 shadow-md">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#00A2FF] text-white font-black px-2.5 py-1 rounded text-lg tracking-tighter">R</div>
            <h1 className="text-2xl font-black uppercase tracking-wider text-white">
              Robloxian<span className="text-[#00A2FF]">News</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3 text-sm font-medium text-[#94A3B8]">
            <span className="bg-[#1E293B] text-xs px-2.5 py-1 rounded-full text-emerald-400 border border-emerald-500/20 animate-pulse">Connected</span>
          </div>
        </div>
      </nav>

      {/* DASHBOARD MAIN BANNER */}
      <div className="w-full bg-gradient-to-r from-[#141B2D] via-[#111827] to-[#0F1115] px-8 py-10 border-b border-[#242936]">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Community Dashboard Feed</h2>
        <p className="text-[#94A3B8] mt-1 text-sm">
          Real-time network log monitoring all active updates, leaks, and reward codes.
        </p>
      </div>

      {/* FEED LAYOUT CONTAINER */}
      <main className="w-full px-8 py-8">
        <Suspense fallback={
          <div className="w-full text-center py-20 text-[#94A3B8] font-medium animate-pulse">
            Connecting to data pipeline stream...
          </div>
        }>
          <NewsList />
        </Suspense>
      </main>
    </div>
  );
}
