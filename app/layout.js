import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import "./globals.css";
import AuthReset from './components/AuthReset';

export const metadata = {
  title: "Student Attendance System",
  description: "Manage student attendance and send email notifications",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <AuthReset />
        <main className="flex-1">
          <NavBar />
        {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
