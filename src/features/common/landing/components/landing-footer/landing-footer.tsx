import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/shared/components/ui/button';
import { FaDiscord, FaGithub, FaLinkedin } from 'react-icons/fa';
import { SiX } from 'react-icons/si';

const socialLinks = [
  {
    name: 'Twitter',
    href: '#',
    icon: SiX,
    ariaLabel: 'StarShop on Twitter',
  },
  {
    name: 'Discord',
    href: '#',
    icon: FaDiscord,
    ariaLabel: 'StarShop on Discord',
  },
  {
    name: 'GitHub',
    href: '#',
    icon: FaGithub,
    ariaLabel: 'StarShop on GitHub',
  },
  {
    name: 'LinkedIn',
    href: '#',
    icon: FaLinkedin,
    ariaLabel: 'StarShop on LinkedIn',
  },
];

const footerLinkColumns = [
  {
    title: 'Platform',
    links: [
      { label: 'Marketplace', href: '#' },
      { label: 'Sell Products', href: '#' },
      { label: 'Shop Now', href: '#' },
      { label: 'NFT Gallery', href: '#' },
      { label: 'Analytics', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Center', href: '#' },
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Community', href: '#' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press Kit', href: '#' },
      { label: 'Partners', href: '#' },
      { label: 'Investors', href: '#' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact Us', href: '#' },
      { label: 'Support Center', href: '#' },
      { label: 'FAQ', href: '#' },
      { label: 'System Status', href: '#' },
      { label: 'Feedback', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'Compliance', href: '#' },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer
      role="contentinfo"
      className="w-full bg-slate-900 text-white border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Block */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <Image
                src="/starshop-logos/StarShop-Logo.svg"
                alt="StarShop Logo"
                width={24}
                height={24}
                className="group-hover:opacity-80 transition-opacity"
              />
              <span className="font-bold text-xl">StarShop</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Blockchain marketplace for transparent commerce and NFT rewards.
              Building the future of decentralized e-commerce.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map(social => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={social.ariaLabel}
                    className="h-9 w-9 bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white rounded-lg transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerLinkColumns.map(column => (
            <div key={column.title} className="space-y-3">
              <h3 className="font-semibold text-white text-sm">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-white/10" />

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400 text-center sm:text-left">
            © {new Date().getFullYear()} StarShop. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-slate-300">Stellar Network</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-500" />
              <span className="text-sm text-slate-300">SSL Secured</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
