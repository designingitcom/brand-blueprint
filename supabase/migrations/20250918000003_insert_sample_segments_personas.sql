-- Insert sample market segments and personas for onboarding

-- Insert Market Segments
INSERT INTO market_segments (id, name, description, characteristics, pain_points, opportunities, industry, business_type, employee_range) VALUES

-- B2B SaaS Segments
('01234567-89ab-cdef-0123-456789abcdef', 'Growing B2B SaaS', 'Fast-growing SaaS companies seeking market differentiation',
 '["Series A funded", "11-50 employees", "High growth pressure", "Venture-backed"]'::jsonb,
 '["Can''t differentiate from competitors", "Unclear positioning", "Marketing messaging doesn''t resonate", "Struggling to stand out"]'::jsonb,
 '["High growth potential", "Need for speed", "Willing to invest", "Data-driven decisions"]'::jsonb,
 'Technology', 'B2B', '11-50'),

('12345678-9abc-def0-1234-56789abcdef0', 'Traditional Businesses Going Digital', 'Established companies undergoing digital transformation',
 '["50-200 employees", "Traditional industry", "Conservative culture", "Established market presence"]'::jsonb,
 '["No digital expertise", "Behind competitors", "Complex decision making", "Risk averse"]'::jsonb,
 '["Big budgets", "Long contracts", "Stable relationships", "Industry expertise valued"]'::jsonb,
 'Manufacturing', 'B2B', '50-200'),

('23456789-abcd-ef01-2345-6789abcdef01', 'Bootstrapped Startups', 'Self-funded companies maximizing limited resources',
 '["1-10 employees", "Founder-led", "Resource constrained", "Agile decision making"]'::jsonb,
 '["Limited budget", "Wearing many hats", "Need quick wins", "Unproven market"]'::jsonb,
 '["Fast decisions", "High loyalty", "Growth focused", "Willing to take risks"]'::jsonb,
 'Technology', 'B2B', '1-10'),

('34567890-bcde-f012-3456-789abcdef012', 'E-commerce Retailers', 'Online retailers competing in crowded marketplaces',
 '["Direct-to-consumer", "Inventory based", "Seasonal fluctuations", "Platform dependent"]'::jsonb,
 '["High customer acquisition costs", "Low margins", "Platform dependency", "Seasonal cash flow"]'::jsonb,
 '["Large addressable market", "Scalable operations", "Data rich", "Direct customer relationships"]'::jsonb,
 'Retail', 'B2C', '11-50'),

('45678901-cdef-0123-4567-89abcdef0123', 'Professional Services Firms', 'Consulting and service-based businesses seeking growth',
 '["People-based business", "Project-driven", "Relationship dependent", "Expertise driven"]'::jsonb,
 '["Commoditized services", "Price competition", "Scaling challenges", "Client retention"]'::jsonb,
 '["High-value relationships", "Repeat business", "Referral potential", "Premium pricing"]'::jsonb,
 'Consulting', 'B2B', '11-50');

-- Insert Customer Personas for each segment
INSERT INTO customer_personas (id, name, title, age_range, description, characteristics, pain_points, goals, reads_follows, triggers, segment_id) VALUES

-- Personas for Growing B2B SaaS
('56789012-def0-1234-5678-9abcdef01234', 'The Ambitious Founder', 'CEO/Founder', '35-45',
 'Recently raised funding and under pressure to show rapid growth and market traction',
 '["Visionary leader", "Data-driven", "Under investor pressure", "Growth focused", "Time constrained"]'::jsonb,
 '["Standing out in crowded market", "Proving product-market fit", "Scaling marketing", "Investor expectations"]'::jsonb,
 '["Rapid revenue growth", "Market leadership", "Successful exit", "Team scaling", "Product adoption"]'::jsonb,
 '["TechCrunch", "First Round Review", "SaaStr", "Y Combinator", "Product Hunt"]'::jsonb,
 '["Board meeting pressure", "Competitor launch", "Funding milestone", "Growth plateau"]'::jsonb,
 '01234567-89ab-cdef-0123-456789abcdef'),

('67890123-ef01-2345-6789-abcdef012345', 'The Overwhelmed Marketing Lead', 'Director of Marketing', '30-40',
 'Marketing leader at fast-growing SaaS company struggling with positioning and messaging',
 '["Small team", "Big goals", "Budget conscious", "Results driven", "Always learning"]'::jsonb,
 '["Unclear positioning", "Low conversion rates", "CEO questioning ROI", "Resource constraints"]'::jsonb,
 '["Clear messaging", "Higher conversions", "Predictable growth", "Team recognition", "Career advancement"]'::jsonb,
 '["HubSpot Blog", "Marketing Land", "Content Marketing Institute", "LinkedIn", "Marketing podcasts"]'::jsonb,
 '["Poor campaign performance", "CEO questioning marketing", "Competitor success", "Board presentation"]'::jsonb,
 '01234567-89ab-cdef-0123-456789abcdef'),

-- Personas for Traditional Businesses Going Digital
('78901234-f012-3456-789a-bcdef0123456', 'The Progressive Executive', 'VP/Director', '40-50',
 'Forward-thinking executive driving digital transformation at traditional company',
 '["Change agent", "Strategic thinker", "Risk aware", "Long-term focused", "Relationship builder"]'::jsonb,
 '["Internal resistance", "Competitor disruption", "Digital skills gap", "Complex approval process"]'::jsonb,
 '["Competitive advantage", "Future-proofing", "Operational efficiency", "Innovation leadership"]'::jsonb,
 '["Harvard Business Review", "McKinsey Insights", "Industry publications", "LinkedIn", "Executive networks"]'::jsonb,
 '["Competitor digital success", "Board digital mandate", "Customer expectations", "Market disruption"]'::jsonb,
 '12345678-9abc-def0-1234-56789abcdef0'),

-- Personas for Bootstrapped Startups
('89012345-0123-4567-89ab-cdef01234567', 'The Resourceful Founder', 'Founder/CEO', '28-38',
 'Self-funded entrepreneur maximizing every dollar and wearing multiple hats',
 '["Scrappy", "Hands-on", "Cost conscious", "Fast learner", "Network dependent"]'::jsonb,
 '["Limited budget", "Doing everything", "Unproven market", "Scaling challenges"]'::jsonb,
 '["Break-even growth", "Market validation", "Sustainable business", "Work-life balance"]'::jsonb,
 '["Indie Hackers", "Reddit", "Twitter", "Podcasts", "Online communities"]'::jsonb,
 '["Cash flow crisis", "Market opportunity", "Competitor threat", "Growth opportunity"]'::jsonb,
 '23456789-abcd-ef01-2345-6789abcdef01'),

-- Personas for E-commerce Retailers
('90123456-1234-5678-9abc-def012345678', 'The Growth-Focused Retailer', 'Founder/Marketing Manager', '25-40',
 'E-commerce entrepreneur focused on scaling revenue and improving margins',
 '["ROI focused", "Data driven", "Customer obsessed", "Platform savvy", "Trend aware"]'::jsonb,
 '["High CAC", "Low margins", "Platform dependency", "Inventory management", "Seasonal fluctuations"]'::jsonb,
 '["Profitable growth", "Customer loyalty", "Brand recognition", "Operational efficiency"]'::jsonb,
 '["Shopify Blog", "E-commerce Fuel", "BigCommerce", "Amazon Seller forums", "Social media"]'::jsonb,
 '["CAC increase", "Platform changes", "Seasonal planning", "Inventory decisions"]'::jsonb,
 '34567890-bcde-f012-3456-789abcdef012'),

-- Personas for Professional Services
('01234567-2345-6789-abcd-ef0123456789', 'The Business Development Partner', 'Partner/BD Director', '35-50',
 'Senior professional responsible for firm growth and client relationships',
 '["Relationship focused", "Industry expert", "Revenue responsible", "Reputation conscious"]'::jsonb,
 '["Commoditized services", "Price competition", "Client retention", "Differentiation"]'::jsonb,
 '["Premium positioning", "Client loyalty", "Referral growth", "Industry leadership"]'::jsonb,
 '["Industry publications", "Professional associations", "LinkedIn", "Conferences", "Peer networks"]'::jsonb,
 '["RFP losses", "Client departure", "New competitor", "Practice review"]'::jsonb,
 '45678901-cdef-0123-4567-89abcdef0123');

-- Update the strategic questions with better AI prompts
UPDATE strategic_questions SET ai_suggestion_prompt =
  CASE question_number
    WHEN 1 THEN 'Analyze the selected persona and segment to suggest expensive problems. Consider: What costly mistakes do they make? What inefficiencies drain resources? What opportunities do they miss? Provide 2-3 specific, quantifiable problems.'
    WHEN 2 THEN 'Based on the persona and industry, suggest category terms customers use when searching for solutions. Consider: What do they Google? What section of a conference would they attend? What job titles solve this? Provide 3-4 category suggestions.'
    WHEN 3 THEN 'Identify obstacles preventing self-solution based on persona characteristics. Consider: Skills gaps? Time constraints? Resource limitations? Risk aversion? Provide specific barriers with explanations.'
    WHEN 4 THEN 'Suggest transformational outcomes based on solving the identified problem. Consider: Revenue impact? Time savings? Risk reduction? Strategic advantage? Provide specific, measurable outcomes.'
    WHEN 5 THEN 'Based on persona profile, suggest identity markers and self-perception traits. Consider: Professional identity? Values? Aspirations? What motivates them? How do they see their role?'
    WHEN 6 THEN 'Identify trigger events that create urgency for this persona and problem. Consider: Business events? Performance issues? External pressures? Timeline factors? Suggest 2-3 specific triggers.'
    WHEN 7 THEN 'Based on services and market position, suggest unique role definitions. Consider: What type of provider are you? What unique approach do you take? How do you differ from category norms?'
    WHEN 8 THEN 'Suggest values that align with persona needs and create differentiation. Consider: What matters most to this persona? What would they pay extra for? What builds trust?'
    WHEN 9 THEN 'Identify contrarian beliefs that differentiate from industry norms. Consider: What does everyone else believe? What opposite approach could work better? What conventional wisdom might be wrong?'
    WHEN 10 THEN 'Suggest strategic exclusions that strengthen positioning. Consider: Customer types to avoid? Services not to offer? Markets to skip? What would weaken your position?'
    WHEN 11 THEN 'Identify realistic alternatives customers would choose. Consider: Competitors? DIY options? Status quo? Alternative categories? Why do these typically fail?'
    WHEN 12 THEN 'Based on unique capabilities and market analysis, suggest defensible "only" positions. Consider: What can only you do? What combination is unique? What barriers exist for others?'
    WHEN 13 THEN 'Suggest decision factors based on persona psychology. Consider: Rational drivers (ROI, features)? Emotional drivers (confidence, status)? Social drivers (reputation, recommendations)?'
    WHEN 14 THEN 'Define specific, measurable value that competitors cannot replicate. Consider: Speed advantages? Quality differences? Unique outcomes? Risk reduction? Process innovations?'
    WHEN 15 THEN 'Suggest realistic success metrics based on business stage and goals. Consider: Revenue targets? Customer metrics? Market position? Timeline factors? Industry benchmarks?'
  END;