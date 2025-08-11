import { Link, useLocation } from "wouter";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: "fas fa-home", label: "Home" },
    { path: "/analytics", icon: "fas fa-chart-bar", label: "Analytics" },
    { path: "/schedule", icon: "fas fa-calendar-alt", label: "Schedule" },
    { path: "/settings", icon: "fas fa-cog", label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center py-2 px-3 transition-colors ${
                location === item.path
                  ? "text-primary"
                  : "text-gray-500 hover:text-primary"
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <i className={`${item.icon} text-lg mb-1`}></i>
              <span className={`text-xs ${location === item.path ? "font-medium" : ""}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
