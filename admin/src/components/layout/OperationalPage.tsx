"use client";

import Link from 'next/link';
import { ArrowRight, CheckCircle2, CircleAlert } from 'lucide-react';

type OperationalPageProps = {
  title: string;
  description: string;
  availableEndpoints?: string[];
  requiredBackend?: string[];
};

export function OperationalPage({
  title,
  description,
  availableEndpoints = [],
  requiredBackend = [],
}: OperationalPageProps) {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-admin-text md:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-admin-muted">{description}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-admin-border bg-admin-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-admin-success">
            <CheckCircle2 className="h-5 w-5" />
            <h2 className="font-semibold text-admin-text">Connected Backend Surface</h2>
          </div>
          {availableEndpoints.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm text-admin-muted">
              {availableEndpoints.map((endpoint) => (
                <li key={endpoint} className="rounded-lg bg-admin-hover px-3 py-2 font-mono text-xs">
                  {endpoint}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-admin-muted">
              No dedicated backend route exists for this module in the current Express API.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-admin-border bg-admin-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-admin-warning">
            <CircleAlert className="h-5 w-5" />
            <h2 className="font-semibold text-admin-text">Production Status</h2>
          </div>
          <p className="mt-4 text-sm text-admin-muted">
            This route is intentionally available to prevent navigation 404s. Full create, update,
            delete, bulk actions, and image workflows should be enabled only after the matching
            backend controllers and validators exist.
          </p>
          {requiredBackend.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-admin-muted">
              {requiredBackend.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-admin-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-admin-border bg-admin-card p-5 shadow-sm">
        <h2 className="font-semibold text-admin-text">Available Management Areas</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            ['Dashboard', '/dashboard'],
            ['Products', '/products'],
            ['Categories', '/categories'],
            ['Orders', '/orders'],
            ['Users', '/users'],
            ['Settings', '/settings'],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-2 rounded-lg border border-admin-border px-3 py-2 text-sm text-admin-muted transition-colors hover:bg-admin-hover hover:text-admin-text"
            >
              {label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OperationalPage;
