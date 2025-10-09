import { useState, useEffect } from 'react';
import TransparencyLogViewer from '../components/TransparencyLogViewer';

interface Constitution {
  version: string;
  principles: string[];
  prohibitions: string[];
  appeals: {
    enabled: boolean;
    slaHours: number;
  };
  bundles: {
    rankingDefault: string;
    moderationDefault: string;
  };
  truthGovernance?: {
    juryDiversity: {
      requiredClusters: string[];
      minimumPerCluster: number;
      maximumPerCluster: number;
      quorumPercentage: number;
    };
    jurorAntiCollusion?: {
      panelOverlapLimit: number;
      ipAsnHeuristics: boolean;
      coordinationDetection: boolean;
      cooloffPeriodDays: number;
    };
    jurorCalibration?: {
      displayEnabled: boolean;
      accuracyMetrics: boolean;
      biasDetection: boolean;
      performanceHistory: boolean;
    };
    evidenceStandards: {
      acceptableClasses: string[];
      minimumQualityScore: number;
      citationHygiene: {
        brokenLinkPenalty: number;
        archiveRequirement: boolean;
      };
    };
    conflictOfInterest: {
      disclosureRequired: boolean;
      recusalThreshold: number;
      cooloffPeriodDays: number;
    };
    appeals: {
      truthSLAHours: number;
      evidenceReviewRequired: boolean;
      panelReselection: boolean;
    };
    transparencyRetention: {
      confidenceReports: string;
      juryDeliberations: string;
      evidenceProvenance: string;
      playfulSignals: string;
    };
  };
  arenaConduct?: {
    playfulSignal: {
      maxWeight: number;
      requiresVerification: boolean;
      entertainmentGrade: boolean;
      documentationInReceipts: boolean;
    };
    disputeResolution: {
      timeLimitHours: number;
      minimumStake: number;
      verificationMethods: string[];
    };
  };
}

interface BundleInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
}

const Governance = () => {
  const [constitution, setConstitution] = useState<Constitution | null>(null);
  const [bundles, setBundles] = useState<BundleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch constitution
        const constitutionRes = await fetch('/api/governance/constitution');
        if (!constitutionRes.ok) throw new Error('Failed to fetch constitution');
        const constitutionData = await constitutionRes.json();
        setConstitution(constitutionData);

        // Fetch bundles
        const bundlesRes = await fetch('/api/governance/bundles');
        if (!bundlesRes.ok) throw new Error('Failed to fetch bundles');
        const bundlesData = await bundlesRes.json();
        setBundles(bundlesData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading governance data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="governance-container">
      <h1>PolyVerse Governance</h1>
      
      {constitution && (
        <section className="constitution-section">
          <h2>Constitution v{constitution.version}</h2>
          
          <div className="principles">
            <h3>Principles</h3>
            <ul>
              {constitution.principles.map((principle, index) => (
                <li key={index}>{principle}</li>
              ))}
            </ul>
          </div>

          <div className="prohibitions">
            <h3>Prohibitions</h3>
            <ul>
              {constitution.prohibitions.map((prohibition, index) => (
                <li key={index}>{prohibition}</li>
              ))}
            </ul>
          </div>

          <div className="appeals">
            <h3>Appeals Process</h3>
            <p>
              Appeals are {constitution.appeals.enabled ? 'enabled' : 'disabled'}.
              {constitution.appeals.enabled && (
                <> Response SLA: {constitution.appeals.slaHours} hours</>
              )}
            </p>
          </div>

          <div className="default-bundles">
            <h3>Default Bundles</h3>
            <p><strong>Ranking:</strong> {constitution.bundles.rankingDefault}</p>
            <p><strong>Moderation:</strong> {constitution.bundles.moderationDefault}</p>
          </div>

          {constitution.truthGovernance && (
            <div className="truth-governance">
              <h3>Truth Governance</h3>
              
              <div className="jury-diversity">
                <h4>Jury Diversity</h4>
                <p><strong>Required clusters:</strong> {constitution.truthGovernance.juryDiversity.requiredClusters.join(', ')}</p>
                <p><strong>Minimum per cluster:</strong> {constitution.truthGovernance.juryDiversity.minimumPerCluster}</p>
                <p><strong>Maximum per cluster:</strong> {constitution.truthGovernance.juryDiversity.maximumPerCluster}</p>
                <p><strong>Quorum:</strong> {constitution.truthGovernance.juryDiversity.quorumPercentage}%</p>
              </div>

              {constitution.truthGovernance.jurorAntiCollusion && (
                <div className="juror-anti-collusion">
                  <h4>Juror Anti-Collusion</h4>
                  <p><strong>Panel overlap limit:</strong> {constitution.truthGovernance.jurorAntiCollusion.panelOverlapLimit * 100}%</p>
                  <p><strong>IP/ASN heuristics:</strong> {constitution.truthGovernance.jurorAntiCollusion.ipAsnHeuristics ? 'Enabled' : 'Disabled'}</p>
                  <p><strong>Coordination detection:</strong> {constitution.truthGovernance.jurorAntiCollusion.coordinationDetection ? 'Enabled' : 'Disabled'}</p>
                  <p><strong>Cool-off period:</strong> {constitution.truthGovernance.jurorAntiCollusion.cooloffPeriodDays} days</p>
                </div>
              )}

              {constitution.truthGovernance.jurorCalibration && (
                <div className="juror-calibration">
                  <h4>Juror Calibration</h4>
                  <p><strong>Display enabled:</strong> {constitution.truthGovernance.jurorCalibration.displayEnabled ? 'Yes' : 'No'}</p>
                  <p><strong>Accuracy metrics:</strong> {constitution.truthGovernance.jurorCalibration.accuracyMetrics ? 'Enabled' : 'Disabled'}</p>
                  <p><strong>Bias detection:</strong> {constitution.truthGovernance.jurorCalibration.biasDetection ? 'Enabled' : 'Disabled'}</p>
                  <p><strong>Performance history:</strong> {constitution.truthGovernance.jurorCalibration.performanceHistory ? 'Enabled' : 'Disabled'}</p>
                </div>
              )}

              <div className="evidence-standards">
                <h4>Evidence Standards</h4>
                <p><strong>Acceptable classes:</strong> {constitution.truthGovernance.evidenceStandards.acceptableClasses.join(', ')}</p>
                <p><strong>Minimum quality score:</strong> {constitution.truthGovernance.evidenceStandards.minimumQualityScore}</p>
                <p><strong>Citation hygiene:</strong> Broken link penalty: {constitution.truthGovernance.evidenceStandards.citationHygiene.brokenLinkPenalty}, Archive required: {constitution.truthGovernance.evidenceStandards.citationHygiene.archiveRequirement ? 'Yes' : 'No'}</p>
              </div>

              <div className="conflict-interest">
                <h4>Conflict of Interest</h4>
                <p><strong>Disclosure required:</strong> {constitution.truthGovernance.conflictOfInterest.disclosureRequired ? 'Yes' : 'No'}</p>
                <p><strong>Recusal threshold:</strong> {constitution.truthGovernance.conflictOfInterest.recusalThreshold}</p>
                <p><strong>Cool-off period:</strong> {constitution.truthGovernance.conflictOfInterest.cooloffPeriodDays} days</p>
              </div>

              <div className="truth-appeals">
                <h4>Truth Appeals</h4>
                <p><strong>SLA:</strong> {constitution.truthGovernance.appeals.truthSLAHours} hours</p>
                <p><strong>Evidence review required:</strong> {constitution.truthGovernance.appeals.evidenceReviewRequired ? 'Yes' : 'No'}</p>
                <p><strong>Panel reselection:</strong> {constitution.truthGovernance.appeals.panelReselection ? 'Yes' : 'No'}</p>
              </div>

              <div className="transparency-retention">
                <h4>Transparency Retention</h4>
                <p><strong>Confidence reports:</strong> {constitution.truthGovernance.transparencyRetention.confidenceReports}</p>
                <p><strong>Jury deliberations:</strong> {constitution.truthGovernance.transparencyRetention.juryDeliberations}</p>
                <p><strong>Evidence provenance:</strong> {constitution.truthGovernance.transparencyRetention.evidenceProvenance}</p>
                <p><strong>Playful signals:</strong> {constitution.truthGovernance.transparencyRetention.playfulSignals}</p>
              </div>
            </div>
          )}

          {constitution.arenaConduct && (
            <div className="arena-conduct">
              <h3>Arena Conduct</h3>
              
              <div className="playful-signal">
                <h4>Playful Signal Rules</h4>
                <p><strong>Max weight:</strong> {constitution.arenaConduct.playfulSignal.maxWeight * 100}%</p>
                <p><strong>Requires verification:</strong> {constitution.arenaConduct.playfulSignal.requiresVerification ? 'Yes' : 'No'}</p>
                <p><strong>Entertainment grade:</strong> {constitution.arenaConduct.playfulSignal.entertainmentGrade ? 'Yes' : 'No'}</p>
                <p><strong>Documentation in receipts:</strong> {constitution.arenaConduct.playfulSignal.documentationInReceipts ? 'Yes' : 'No'}</p>
              </div>

              <div className="dispute-resolution">
                <h4>Dispute Resolution</h4>
                <p><strong>Time limit:</strong> {constitution.arenaConduct.disputeResolution.timeLimitHours} hours</p>
                <p><strong>Minimum stake:</strong> ${constitution.arenaConduct.disputeResolution.minimumStake}</p>
                <p><strong>Verification methods:</strong> {constitution.arenaConduct.disputeResolution.verificationMethods.join(', ')}</p>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="bundles-section">
        <h2>Available Bundles</h2>
        <div className="bundles-grid">
          {bundles.map(bundle => (
            <div key={bundle.id} className="bundle-card">
              <h3>{bundle.name}</h3>
              <p className="bundle-id">ID: {bundle.id}</p>
              <p className="bundle-description">{bundle.description}</p>
              <div className="bundle-meta">
                <span>v{bundle.version}</span>
                <span>by {bundle.author}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="transparency-log-section">
        <h2>Transparency Log</h2>
        <p>The transparency log contains all algorithmic decisions and moderation actions taken on the platform.</p>
        <TransparencyLogViewer />
      </section>

      <style jsx>{`
        .governance-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        h1 {
          color: #1976d2;
          margin-bottom: 2rem;
          text-align: center;
        }

        h2 {
          color: #333;
          border-bottom: 2px solid #1976d2;
          padding-bottom: 0.5rem;
          margin: 2rem 0 1rem 0;
        }

        h3 {
          color: #555;
          margin: 1rem 0 0.5rem 0;
        }

        .constitution-section {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .principles ul,
        .prohibitions ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .principles li {
          color: #28a745;
        }

        .prohibitions li {
          color: #dc3545;
        }

        .appeals p {
          background: #e3f2fd;
          padding: 0.75rem;
          border-radius: 4px;
          border-left: 4px solid #1976d2;
        }

        .default-bundles p {
          margin: 0.5rem 0;
          padding: 0.5rem;
          background: #f5f5f5;
          border-radius: 4px;
        }

        .truth-governance,
        .arena-conduct {
          margin-top: 2rem;
          padding: 1.5rem;
          background: #f0f8ff;
          border-radius: 8px;
          border: 1px solid #cce5ff;
        }

        .truth-governance h3,
        .arena-conduct h3 {
          color: #1976d2;
          border-bottom: 2px solid #1976d2;
          padding-bottom: 0.5rem;
          margin-top: 0;
        }

        .truth-governance h4,
        .arena-conduct h4 {
          color: #555;
          margin: 1rem 0 0.5rem 0;
        }

        .truth-governance > div,
        .arena-conduct > div {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: white;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }

        .truth-governance p,
        .arena-conduct p {
          margin: 0.25rem 0;
          line-height: 1.4;
        }

        .bundles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .bundle-card {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #ddd;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .bundle-card h3 {
          margin: 0 0 0.5rem 0;
          color: #1976d2;
        }

        .bundle-id {
          font-family: monospace;
          font-size: 0.8rem;
          color: #666;
          margin: 0 0 0.5rem 0;
        }

        .bundle-description {
          margin: 0 0 1rem 0;
          line-height: 1.4;
        }

        .bundle-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #888;
        }

        .transparency-log-section {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
      `}</style>
    </div>
  );
};

export default Governance;