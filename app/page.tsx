'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Dashboard</h1>
        <ul>
          <li>
            <Link href="/students">Students</Link>
          </li>
          <li>
            <Link href="/payments">Payments</Link>
          </li>
          <li>
            <Link href="/settings">Settings</Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
