export interface LeafDiseaseRuntime {
  // Identity
  userId: string;
  sessionId: string;

  // Live API conversation
  conversation?: {
    handle?: string;
  };

  // Plant / disease context
  plant: {
    cropId: string;
    cropName: string;

    diseaseId?: string;
    diseaseName?: string;
    confidence?: number;
  };

  // Cached RAG result
  rag?: {
    queries: string[];
    context: string;
    retrievedAt: Date;
  };

  // Runtime metadata
  createdAt: Date;
  lastActivityAt: Date;
}
