import { useEffect, useState } from 'react';
import './SplashScreen.css';
import { useNavigate } from 'react-router-dom';
import RunacossLogo from '../../assets/icons/runacossLogo.svg?url';
import FallingParticles from '../../componentLibrary/FallingParticles';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState('');
  const fullText = 'RUNACOSS';
  const [cursorVisible, setCursorVisible] = useState(true);
  const [logoShifted, setLogoShifted] = useState(false);

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      setTypedText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) {
        clearInterval(typingInterval);

        let blinkCount = 0;
        const blinkInterval = setInterval(() => {
          setCursorVisible(prev => !prev);
          blinkCount++;
          if (blinkCount === 6) {
            clearInterval(blinkInterval);
            navigate('/home');
          }
        }, 300);
      }
    }, 150);

    setLogoShifted(true);

    return () => {
      clearInterval(typingInterval);
    };
  }, [navigate]);

  return (
    <div className="splash-screen-wrapper">
      <div className="particles-wrapper">
        <FallingParticles />
      </div>
      <div className="splash-container">
        <div className={`logo-wrapper ${logoShifted ? 'shifted' : ''}`}>
          <img src={RunacossLogo} alt="RUNACOSS Logo" className="logo" />
        </div>
        <div className="text-wrapper">
          <span className="runa">{typedText.slice(0, 4)}</span>
          <span className="coss">{typedText.slice(4)}</span>
          <span className="cursor" style={{ opacity: cursorVisible ? 1 : 0 }}>|</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
