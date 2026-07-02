# translation.py - Multilingual emergency translation and cultural localization agent
# Rapidly parses multi-language alerts and translates critical response briefs into local dialects.

import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

# =====================================================================
# AGENT SCHEMAS (Input / Output)
# =====================================================================

class TranslationInput(BaseModel):
    text_to_translate: str = Field(..., description="The incoming emergency message, citizen report, or medical status text.")
    target_language: str = Field(default="English", description="Target language standard name (e.g. 'Spanish', 'Hindi', 'Tagalog', 'Vietnamese', 'English').")
    context_urgency: str = Field(default="medium", description="Urgency scale: 'low', 'medium', 'high', 'critical'.")

class TranslationOutput(BaseModel):
    detected_source_language: str = Field(..., description="The detected source language of the input text.")
    translated_text: str = Field(..., description="The translated text normalized for rapid emergency/medical comprehension.")
    confidence_score: float = Field(..., description="Confidence index of translation accuracy (0.0 to 1.0).")
    cultural_or_linguistic_notes: Optional[str] = Field(default=None, description="Important dialect specifics, slang adjustments, or idiom translations (e.g. 'This phrase is an idiom for immediate physical distress').")

# =====================================================================
# AGENT DEFINITION & IMPLEMENTATION
# =====================================================================

class TranslationAgent:
    """
    Responsibilities:
    - Automatically detects the language of incoming emergency messages.
    - Performs high-fidelity translation optimized for clinical and tactical jargon.
    - Prevents meaning-loss during severe distress reports.
    - Adjusts cultural context to guarantee correct local comprehension of evacuation bulletins.
    """

    def __init__(self):
        self.model_name = "gemini-3.5-flash"
        self.system_instruction = (
            "You are the Emergency Translation Agent of ReliefAI.\n\n"
            "Your main role is to translate emergency reports, distress signals, and responder commands "
            "between English and local target languages. Ensure that translations are crystal clear, "
            "culturally appropriate, and preserve critical facts (e.g., medical symptoms, street names, hazards) "
            "without exaggeration or omissions."
        )

    def _get_client(self) -> genai.Client:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not configured.")
        return genai.Client(
            api_key=api_key,
            http_options={"headers": {"User-Agent": "aistudio-build"}}
        )

    def execute(self, data: TranslationInput) -> TranslationOutput:
        """
        Processes multilingual input and generates highly accurate structured translations.
        """
        client = self._get_client()
        prompt_content = (
            f"Text to translate: {data.text_to_translate}\n"
            f"Target language: {data.target_language}\n"
            f"Urgency tier: {data.context_urgency}"
        )

        response = client.models.generate_content(
            model=self.model_name,
            contents=prompt_content,
            config=types.GenerateContentConfig(
                system_instruction=self.system_instruction,
                response_mime_type="application/json",
                response_schema=TranslationOutput,
                temperature=0.1,
            )
        )

        if response.text:
            return TranslationOutput.model_validate_json(response.text)
        else:
            raise RuntimeError("Translation Agent failed to produce structured outputs.")
