import './globals.css';
import {BrandExperience,BrandLogo} from '../components/BrandExperience';

export const metadata={title:'Lucky Hair Salon | Since 1994',description:'Lucky Hair Salon operations system'};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>
    <BrandExperience/>
    <div className="pointer-events-none fixed left-1/2 top-2 z-[80] -translate-x-1/2 select-none"><BrandLogo/></div>
    {children}
  </body></html>
}
