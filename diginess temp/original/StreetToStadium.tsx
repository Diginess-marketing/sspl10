import React from 'react';
import { 
  Users, 
  Cpu, 
  TrendingUp, 
  ClipboardCheck, 
  MapPin, 
  UserCheck, 
  Gavel, 
  Trophy,
  ArrowRight
} from 'lucide-react';
import './StreetToStadium.css';

const StreetToStadium: React.FC = () => {
    return (
        <section className="sts-container" id="street-to-stadium">
            <div className="sts-wrapper">
                {/* Header Redesign - Horizontal & Compact */}
                <div className="sts-header">
                    <h2 className="sts-title-horizontal">
                        <span className="sts-title-street">STREET</span>
                        <span className="sts-title-to">TO</span>
                        <span className="sts-title-stadium">STADIUM</span>
                    </h2>
                    <p className="sts-subtitle">
                        India's Premier T10 Tennis Ball Cricket League. Empowering grassroots talent to shine on the national stage.
                    </p>
                </div>

                {/* Info Cards Grid - Compact */}
                <div className="sts-info-grid">
                    <div className="sts-glass-card">
                        <div className="sts-card-icon">
                            <Users size={28} />
                        </div>
                        <h3 className="sts-card-title">Inclusivity</h3>
                        <p className="sts-card-text">
                            Breaking barriers and bringing together players from every corner of the country.
                        </p>
                    </div>
                    <div className="sts-glass-card">
                        <div className="sts-card-icon cyan">
                            <Cpu size={28} />
                        </div>
                        <h3 className="sts-card-title">Innovation</h3>
                        <p className="sts-card-text">
                            Leveraging modern formats to revolutionize how tennis ball cricket is played.
                        </p>
                    </div>
                    <div className="sts-glass-card">
                        <div className="sts-card-icon">
                            <TrendingUp size={28} />
                        </div>
                        <h3 className="sts-card-title">Growth</h3>
                        <p className="sts-card-text">
                            Providing a clear roadmap for players to scale their skills to professional benchmarks.
                        </p>
                    </div>
                </div>

                {/* SSPL Player Journey Section */}
                <div className="sts-pathway-section">
                    <h2 className="sts-pathway-title">SSPL <span>PLAYER JOURNEY</span></h2>
                    
                    <div className="sts-pathway-container">
                        <div className="sts-pathway-line"></div>
                        
                        <div className="sts-pathway-step">
                            <div className="sts-step-node"></div>
                            <div className="sts-step-card">
                                <span className="sts-step-number">01</span>
                                <div className="sts-step-content">
                                    <h4>Register Online</h4>
                                    <p>Sign up and create your profile on our digital platform.</p>
                                </div>
                                <div className="sts-step-icon">
                                    <img src="/assets/3d-icons/teams-icon-v2.png" alt="Register" />
                                </div>
                            </div>
                        </div>

                        <div className="sts-pathway-step">
                            <div className="sts-step-node"></div>
                            <div className="sts-step-card">
                                <span className="sts-step-number">02</span>
                                <div className="sts-step-content">
                                    <h4>City Trials</h4>
                                    <p>Showcase your skills at trial locations across major cities.</p>
                                </div>
                                <div className="sts-step-icon">
                                    <img src="/assets/3d-icons/sharjah-icon.png" alt="Trials" />
                                </div>
                            </div>
                        </div>

                        <div className="sts-pathway-step">
                            <div className="sts-step-node"></div>
                            <div className="sts-step-card">
                                <span className="sts-step-number">03</span>
                                <div className="sts-step-content">
                                    <h4>Player Selection</h4>
                                    <p>Top performers are allocated for the professional draft.</p>
                                </div>
                                <div className="sts-step-icon">
                                    <img src="/assets/3d-icons/cricket-player.png" alt="Selection" />
                                </div>
                            </div>
                        </div>

                        <div className="sts-pathway-step">
                            <div className="sts-step-node"></div>
                            <div className="sts-step-card">
                                <span className="sts-step-number">04</span>
                                <div className="sts-step-content">
                                    <h4>SSPL Auction</h4>
                                    <p>Selected players are picked by franchise teams in a live auction.</p>
                                </div>
                                <div className="sts-step-icon">
                                    <img src="/assets/3d-icons/auction-gavel.png" alt="Auction" />
                                </div>
                            </div>
                        </div>

                        <div className="sts-pathway-step">
                            <div className="sts-step-node"></div>
                            <div className="sts-step-card">
                                <span className="sts-step-number">05</span>
                                <div className="sts-step-content">
                                    <h4>Finals at Sharjah</h4>
                                    <p>Compete at the world-class Sharjah Cricket Stadium for the ultimate glory.</p>
                                </div>
                                <div className="sts-step-icon">
                                    <img src="/assets/3d-icons/prize-money-icon.png" alt="Finals" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Spirit Section */}
                <div className="sts-spirit">
                    <div className="sts-spirit-content">
                        <h2>The Spirit of Street Cricket</h2>
                        <p>
                            SSPL preserves the raw energy of street cricket while providing the professional platform you deserve.
                        </p>
                        <button className="sts-spirit-btn">
                            Register Now <ArrowRight size={20} />
                        </button>
                    </div>

                    <div className="sts-spirit-video-card">
                        <iframe
                            src="https://www.youtube.com/embed/QrBQAv3D1cU"
                            title="SSPL Anthem"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StreetToStadium;
