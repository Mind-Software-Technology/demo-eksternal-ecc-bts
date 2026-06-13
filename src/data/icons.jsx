// ───────────────────────────────────────────────────────────────────────────
// Icon registry — maps string names used in data files to react-icons
// components. This keeps the data modules free of JSX/imports.
// ───────────────────────────────────────────────────────────────────────────
import {
  FiCheckCircle,
  FiBarChart2,
  FiGlobe,
  FiEdit3,
  FiMonitor,
  FiBookOpen,
  FiShield,
  FiClock,
  FiUsers,
  FiLock,
  FiAward,
  FiPhone,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiArrowRight,
  FiArrowUp,
  FiMenu,
  FiX,
  FiSearch,
  FiTrendingUp,
  FiSend,
  FiStar,
  FiChevronDown,
  FiTarget,
  FiHeart,
  FiZap,
  FiFileText,
  FiLayers,
} from 'react-icons/fi'
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaTiktok,
  FaYoutube,
  FaQuoteLeft,
} from 'react-icons/fa6'

const ICONS = {
  // services
  FiCheckCircle,
  FiBarChart2,
  FiGlobe,
  FiEdit3,
  FiMonitor,
  FiBookOpen,
  // advantages / misc
  FiShield,
  FiClock,
  FiUsers,
  FiLock,
  FiAward,
  FiPhone,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiArrowRight,
  FiArrowUp,
  FiMenu,
  FiX,
  FiSearch,
  FiTrendingUp,
  FiSend,
  FiStar,
  FiChevronDown,
  FiTarget,
  FiHeart,
  FiZap,
  FiFileText,
  FiLayers,
  // brand
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaTiktok,
  FaYoutube,
  FaQuoteLeft,
}

// Helper component: <Icon name="FiShield" /> (falls back to null if missing).
export function Icon({ name, ...props }) {
  const Cmp = ICONS[name]
  return Cmp ? <Cmp {...props} /> : null
}
