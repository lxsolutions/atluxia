import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      // Fetch constitution from indexer
      const response = await fetch('http://localhost:3002/governance/constitution');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching constitution:', error);
      
      // Fallback to local constitution if indexer is unavailable
      const fallbackConstitution = {
        version: "0.3",
        principles: [
          "Viewpoint diversity is fundamental to healthy discourse",
          "Algorithmic transparency enables informed participation",
          "Governance should be community-driven and adaptable",
          "Provenance and attribution preserve context and trust",
          "Evidence-based truth seeking",
          "Playful engagement with bounded influence"
        ],
        prohibitions: [
          "doxxing",
          "incitement to violence",
          "targeted harassment",
          "coordinated inauthentic behavior",
          "non-consensual intimate media"
        ],
        appeals: {
          enabled: true,
          slaHours: 72
        },
        bundles: {
          rankingDefault: "recency_follow",
          moderationDefault: "baseline_rules"
        },
        truthGovernance: {
          juryDiversity: {
            requiredClusters: ["ICC", "BRICS", "NATO", "NonAligned", "Academic", "CivilSociety"],
            minimumPerCluster: 1,
            maximumPerCluster: 3,
            quorumPercentage: 67
          },
          evidenceStandards: {
            acceptableClasses: ["peer_reviewed", "primary_source", "official_record", "expert_testimony", "dataset", "reputable_media"],
            minimumQualityScore: 0.6,
            citationHygiene: {
              brokenLinkPenalty: -0.3,
              archiveRequirement: true
            }
          },
          conflictOfInterest: {
            disclosureRequired: true,
            recusalThreshold: 0.3,
            cooloffPeriodDays: 30
          },
          appeals: {
            truthSLAHours: 96,
            evidenceReviewRequired: true,
            panelReselection: true
          },
          transparencyRetention: {
            confidenceReports: "permanent",
            juryDeliberations: "30_days_anonymous",
            evidenceProvenance: "permanent",
            playfulSignals: "permanent"
          }
        },
        arenaConduct: {
          playfulSignal: {
            maxWeight: 0.02,
            requiresVerification: true,
            entertainmentGrade: true,
            documentationInReceipts: true
          },
          disputeResolution: {
            timeLimitHours: 72,
            minimumStake: 10.0,
            verificationMethods: ["automated", "manual_review", "community_vote"]
          }
        }
      };
      
      res.status(200).json(fallbackConstitution);
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;