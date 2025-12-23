// Supabase Edge Function: process-job
// Processes analysis jobs - downloads CSV, does minimal parsing, updates status

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobPayload {
  jobId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { jobId } = (await req.json()) as JobPayload;

    if (!jobId) {
      return new Response(JSON.stringify({ error: "jobId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Get job details
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Update status to running
    await supabase
      .from("jobs")
      .update({ status: "running" })
      .eq("id", jobId);

    // 3. Download the CSV from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("analysis-uploads")
      .download(job.input_file_path);

    if (downloadError || !fileData) {
      await supabase
        .from("jobs")
        .update({ status: "error", error_message: "Failed to download file" })
        .eq("id", jobId);

      return new Response(JSON.stringify({ error: "File download failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Parse CSV (minimal processing for demo)
    const csvText = await fileData.text();
    const lines = csvText.trim().split("\n");
    const headers = lines[0]?.split(",").map((h) => h.trim().replace(/"/g, "")) || [];
    const rowCount = lines.length - 1; // Exclude header

    // 5. Generate mock result based on job type
    const result = generateMockResult(job.job_type, headers, rowCount);

    // 6. Update job with results
    await supabase
      .from("jobs")
      .update({
        status: "done",
        result: result,
      })
      .eq("id", jobId);

    // 7. Clean up: delete the uploaded file
    await supabase.storage
      .from("analysis-uploads")
      .remove([job.input_file_path]);

    // 8. Clear file path from job record
    await supabase
      .from("jobs")
      .update({ input_file_path: null })
      .eq("id", jobId);

    return new Response(
      JSON.stringify({ success: true, jobId, result }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Processing error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Generate mock results based on job type
function generateMockResult(
  jobType: string,
  headers: string[],
  rowCount: number
): Record<string, unknown> {
  const base = {
    processedAt: new Date().toISOString(),
    inputRows: rowCount,
    columns: headers,
  };

  switch (jobType) {
    case "poisson_factorization":
      return {
        ...base,
        type: "Poisson Factorization",
        factors: [
          { name: "Engagement", weight: 0.42, topFeatures: headers.slice(0, 3) },
          { name: "Retention", weight: 0.31, topFeatures: headers.slice(1, 4) },
          { name: "Expansion", weight: 0.27, topFeatures: headers.slice(2, 5) },
        ],
        reconstruction_error: 0.023,
      };

    case "survival_analysis":
      return {
        ...base,
        type: "Survival Analysis",
        medianSurvivalDays: 847,
        hazardRatios: headers.slice(0, 4).map((h, i) => ({
          feature: h,
          hr: +(1 + Math.random()).toFixed(2),
          pValue: +(Math.random() * 0.1).toFixed(3),
        })),
        concordanceIndex: 0.73,
      };

    case "nrr_decomposition":
      return {
        ...base,
        type: "NRR Decomposition",
        netRevenueRetention: 1.12,
        components: {
          grossRetention: 0.94,
          expansion: 0.23,
          contraction: -0.05,
        },
        cohortTrends: [
          { cohort: "Q1", nrr: 1.08 },
          { cohort: "Q2", nrr: 1.15 },
          { cohort: "Q3", nrr: 1.12 },
        ],
      };

    case "propensity_model":
      return {
        ...base,
        type: "Propensity Model",
        avgWinProbability: 0.34,
        avgExpectedACV: 48500,
        avgTimeToClose: 62,
        topPredictors: headers.slice(0, 3).map((h) => ({
          feature: h,
          importance: +(Math.random()).toFixed(2),
        })),
        auc: 0.81,
      };

    default:
      return {
        ...base,
        type: "Unknown",
        message: "Processed successfully",
      };
  }
}


