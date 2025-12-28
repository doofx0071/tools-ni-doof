"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calculator, CheckCircle2, Code2, Globe, LayoutGrid, Terminal } from "lucide-react";
import Link from "next/link";

const tools = [
  {
    name: "To-Do List",
    description: "Manage your tasks with real-time sync and premium design.",
    icon: CheckCircle2,
    href: "/todo-list",
    color: "from-violet-500 to-indigo-500",
  },
  {
    name: "Webhook Tester",
    description: "Debug and inspect incoming webhooks with ease.",
    icon: Terminal,
    href: "/webhook-tester",
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "JSON Formatter",
    description: "Format, validate, and beautify your JSON data.",
    icon: Code2,
    href: "#",
    color: "from-orange-500 to-amber-500",
    upcoming: true,
  },
  {
    name: "Unit Converter",
    description: "Quickly convert between any units of measurement.",
    icon: Calculator,
    href: "#",
    color: "from-pink-500 to-rose-500",
    upcoming: true,
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white/20 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <main className="relative z-10 container mx-auto px-6 py-24">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <LayoutGrid className="text-black w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Tools ni Doof</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400"
          >
            <Link href="#" className="hover:text-white transition-colors">Documentation</Link>
            <Link href="#" className="hover:text-white transition-colors">Support</Link>
            <Link href="#" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors">GitHub</Link>
          </motion.div>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-white/5 border border-white/10 rounded-full text-zinc-400">
              Introducing Tools ni Doof 1.0
            </span>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              One Workspace. <br /> Every Tool.
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Professional-grade tools for developers and creators. Built with real-time sync, offline support, and a premium experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#tools"
                className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                Start Exploring <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                All Features
              </button>
            </div>
          </motion.div>
        </div>

        {/* Tools Grid */}
        <section id="tools" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                href={tool.href}
                className="group relative block p-8 rounded-3xl glass transition-all hover:scale-[1.02]"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tool.color} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity rounded-full`} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${tool.color} shadow-lg shadow-black/20`}>
                      <tool.icon className="w-8 h-8 text-white" />
                    </div>
                    {tool.upcoming && (
                      <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 bg-white/5 border border-white/10 rounded-full text-zinc-500">
                        Soon
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold mb-3 group-hover:translate-x-1 transition-transform">{tool.name}</h3>
                  <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </section>

        {/* Footer */}
        <footer className="mt-32 pt-16 border-t border-white/5 text-center text-zinc-500 text-sm">
          <p>© 2024 Tools ni Doof. Built with ❤️ and Next.js 15.</p>
        </footer>
      </main>
    </div>
  );
}
