
// "use client";

// import Link from "next/link";
// import Image from "next/image";

// export default function Header() {
//   return (
//     <header className="w-full border-b bg-white">
//       <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">

//         {/* LOGO */}
//         <Link href="/" className="flex items-center gap-3">
//           <Image
//             src="/citadel.jpg"
//             alt="Magic DB Logo"
//             width={48}
//             height={48}
//             className="rounded-md"
//             priority
//           />
//         </Link>

//         {/* NAVIGATION */}
//         <nav className="flex items-center gap-6">
//           <NavLink href="/sets">Sets</NavLink>
//           <NavLink href="/admin">Admin</NavLink>
//         </nav>
//       </div>
//     </header>
//   );
// }

// /* ————————————————————————————————
//    REUSABLE LINK COMPONENT
// ——————————————————————————————— */

// function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
//   return (
//     <Link
//       href={href}
//       className="
//         text-gray-600 hover:text-black
//         font-medium text-sm
//         transition-colors
//         pb-1 border-b-2 border-transparent hover:border-black
//       "
//     >
//       {children}
//     </Link>
//   );
// }


"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/citadel.jpg"
            alt="Citadel"
            width={48}
            height={48}
            className="rounded-md"
            priority
          />
          Citadel
        </Link>

        {/* NAVIGATION */}
        <nav className="flex items-center gap-6">
          <NavLink href="/sets" current={pathname} >Sets</NavLink>
          <NavLink href="/admin" current={pathname}>Admin</NavLink>
        </nav>

      </div>
    </header>
  );
}

function NavLink({
  href,
  current,
  children,
}: {
  href: string;
  current: string;
  children: React.ReactNode;
}) {
  const isActive = current.startsWith(href);

  return (
    <Link
      href={href}
      className={`
        pb-1 text-sm font-medium transition-colors 
        ${isActive ? "text-black border-b-2 border-black" : "text-gray-600 border-b-2 border-transparent hover:border-black hover:text-black"}
      `}
    >
      {children}
    </Link>
  );
}
