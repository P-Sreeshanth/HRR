"""PDF Resume Parser Service using pdfplumber."""
import pdfplumber
from typing import Optional
import io
import re


class PDFParser:
    """Extract and clean text from PDF resumes."""
    
    def __init__(self):
        self.section_headers = [
            "experience", "work experience", "professional experience",
            "education", "academic background",
            "skills", "technical skills", "core competencies",
            "projects", "certifications", "awards"
        ]
    
    def extract_text(self, pdf_bytes: bytes) -> str:
        """
        Extract text from PDF bytes.
        
        Args:
            pdf_bytes: Raw PDF file content
            
        Returns:
            Extracted and cleaned text
        """
        text_parts = []
        
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        
        raw_text = "\n".join(text_parts)
        return self._clean_text(raw_text)
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize extracted text."""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Fix common PDF extraction issues
        text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)  # CamelCase splits
        
        # Normalize line breaks around section headers
        for header in self.section_headers:
            pattern = re.compile(rf'({header})', re.IGNORECASE)
            text = pattern.sub(r'\n\n\1\n', text)
        
        return text.strip()
    
    def extract_sections(self, text: str) -> dict:
        """
        Extract resume sections from text.
        
        Returns:
            Dict with section names as keys and content as values
        """
        sections = {}
        current_section = "summary"
        current_content = []
        
        lines = text.split('\n')
        
        for line in lines:
            line_lower = line.lower().strip()
            
            # Check if this line is a section header
            is_header = False
            for header in self.section_headers:
                if header in line_lower and len(line_lower) < 50:
                    # Save previous section
                    if current_content:
                        sections[current_section] = '\n'.join(current_content).strip()
                    
                    # Start new section
                    current_section = header
                    current_content = []
                    is_header = True
                    break
            
            if not is_header and line.strip():
                current_content.append(line)
        
        # Save last section
        if current_content:
            sections[current_section] = '\n'.join(current_content).strip()
        
        return sections
    
    def extract_contact_info(self, text: str) -> dict:
        """Extract email and phone from resume text."""
        email_pattern = r'[\w\.-]+@[\w\.-]+\.\w+'
        phone_pattern = r'[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}'
        
        email_match = re.search(email_pattern, text)
        phone_match = re.search(phone_pattern, text)
        
        return {
            "email": email_match.group() if email_match else None,
            "phone": phone_match.group() if phone_match else None
        }


# Singleton instance
pdf_parser = PDFParser()
