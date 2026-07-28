import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { HeroSection } from '../components/HeroSection';
import { ThreePanelFooter } from '../components/ThreePanelFooter';

const Landing = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // If already logged in, navigate straight to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-[#FEFDF9] overflow-x-hidden antialiased text-black">
      <main>
        <HeroSection />
        <ThreePanelFooter />
      </main>
    </div>
  );
};

export default Landing;
