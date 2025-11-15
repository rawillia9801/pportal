"use client";

export default function AdminOverviewPage() {
  return (
    <div className="tab-inner">
      <h2>Welcome to the Admin Portal</h2>
      <p>
        Use this portal to manage every part of your Chihuahua breeding program:
        puppies, litters, applications, messages, transport requests, and your
        core breeding dogs.
      </p>
      <p>
        Pick a section from the left to get started. As we wire more features,
        you&apos;ll see live data from your Supabase tables here, instead of
        placeholder text.
      </p>

      <style jsx>{`
        .tab-inner {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 14px;
          color: #4b5563;
        }
        h2 {
          margin: 0 0 4px;
          font-size: 18px;
          color: #111827;
        }
        p {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
