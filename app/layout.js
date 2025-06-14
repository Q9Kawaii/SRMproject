import Footer from './components/Footer'
import NavBar from './components/NavBar'
import './globals.css'

export const metadata = {
  title: 'Student Attendance System',
  description: 'Manage student attendance and send email notifications',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NavBar/>
        {children}
        <Footer/>
      </body>
    </html>
  )
}
