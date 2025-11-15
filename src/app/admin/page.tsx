"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

type AdminStats = {
  buyers: number;
  puppies: number;
  applications: number;
  payments: number;
  messages: number;
  transports: number;
};

const EMPTY_STATS: AdminStats = {
  buyers: 0,
  puppies: 0,
  applications: 0,
  payments: 0,
  messages: 0,
  transports: 0,
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getBrowserClient();

    async function countRows(table: string) {
      const { count, error } = await supabase
        .from(table)
        .select("*", { head: true, count: "exact" });
      if (error) {
        console.error("Failed to count", table, error.message);
        return 0;
      }
      return count ?? 0;
    }

    async function load() {
      try {
        const [
          buyers,
          puppies,
          applications,
          payments,
          messages,
          transports,
        ] = await Promise.all([
          countRows("buyers"),
          countRows("puppies"),
          countRows("applications"),
          countRows("payments"),
          countRows("messages"),
          countRows("transport_requests"),
        ]);

        setStats({
          buyers,
          puppies,
          applications,
          payments,
          messages,
          transports,
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <section>
      <h1 className="admin-h1">Admin Dashboard</h1>
      <p className="admin-subtitle">
        Quick overview of your program. Use the sidebar to move into each
        workflow for detailed management.
      </p>

      <div className="admin-stat-grid">
        <StatCard
          label="BUYERS"
          helper="Approved families"
          value={stats.buyers}
          loading={loading}
        />
        <StatCard
          label="PUPPIES"
          helper="In the system"
          value={stats.puppies}
          loading={loading}
        />
        <StatCard
          label="APPLICATIONS"
          helper="Pending or reviewed"
          value={stats.applications}
          loading={loading}
        />
        <StatCard
          label="PAYMENTS"
          helper="Recorded payments"
          value={stats.payments}
          loading={loading}
        />
        <StatCard
          label="MESSAGES"
          helper="Conversations"
          value={stats.messages}
          loading={loading}
        />
        <StatCard
          label="TRANSPORT REQUESTS"
          helper="Trips to plan"
          value={stats.transports}
          loading={loading}
        />
      </div>
    </section>
  );
}

function StatCard(props: {
  label: string;
  helper: string;
  value: number;
  loading: boolean;
}) {
  const { label, helper, value, loading } = props;
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">{loading ? "…" : value}</div>
      <div className="admin-stat-helper">{helper}</div>
    </div>
  );
}
