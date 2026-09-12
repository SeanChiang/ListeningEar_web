import { NextResponse } from 'next/server';
import { appendToSheet } from '@/lib/google';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const recordId = 'LE-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 100).toString().padStart(2, '0');

    // Formatting data for the sheet row
    // Column order matches the fields we collect
    const rowData = [
      recordId,
      new Date().toISOString(), // Submission Timestamp
      body.date,
      body.time,
      body.referralSource,
      body.referralReason,
      body.volunteerName,
      body.volunteerRole,
      body.volunteerEmail,
      body.volunteerPhone,
      body.subjectName,
      body.subjectPhone,
      body.subjectAddress,
      body.parentName,
      body.parentPhone,
      body.parentAddress,
      body.shelterLocation,
      body.consultationProcess,
      body.mainComplaint,
      body.obsInjuryStatus,
      body.obsInjuryDesc,
      `Sleep: ${body.obsSleep} | Appetite: ${body.obsAppetite} | Energy: ${body.obsEnergy} | Behavior: ${body.obsResilience}`,
      body.understanding,
      body.triageLevel,
      body.triageAction,
      body.aiLevel,
      body.aiReasoning,
      body.aiSuggestedAction
    ];

    await appendToSheet(rowData);

    return NextResponse.json({ success: true, recordId });
  } catch (error) {
    console.error("Submit API Error:", error);
    return NextResponse.json(
      { error: 'Failed to save record securely.' },
      { status: 500 }
    );
  }
}
