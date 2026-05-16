'use client';
// Chakra imports
import { Box, Flex, HStack, SimpleGrid } from '@chakra-ui/react';

import TemplateCard from '@/components/card/TemplateCard';

export default function Settings() {
  return (
    <Box mt={{ base: '70px', md: '0px', xl: '0px' }}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing="20px">
        <TemplateCard
          admin={true}
          link="/essay"
          illustration="📝"
          name="Write an Essay"
          description="Generate an Essay based on a type, subject and number of paragraphs."
        />
        <TemplateCard
          admin={true}
          link="/simplifier"
          illustration="👶"
          name="Content Simplifier"
          description="Summarize text content for all age types of audience."
        />
        <TemplateCard
          admin={true}
          link="/product-description"
          illustration="🎯"
          name="Product Description"
          description="Generate compelling & high converting descriptions for product listings."
        />
        <TemplateCard
          admin={true}
          link="/email-enhancer"
          illustration="📧"
          name="Email Enhancer"
          description="Generate an incredibly clickable email from text content."
        />
        <TemplateCard
          admin={true}
          link="/caption"
          illustration="🌄"
          name="Instagram Caption"
          description="Generate a compelling and engaging caption for an Instagram post."
        />
        <TemplateCard
          admin={true}
          link="/faq"
          illustration="❓"
          name="FAQs Content"
          description="Generate FAQs for a product, web app, or landing pages."
        />
        <TemplateCard
          admin={true}
          link="/name-generator"
          illustration="🏷️"
          name="Product Name Generator"
          description="Generate product names from example words, topics, or work industries."
        />
        <TemplateCard
          admin={true}
          link="/seo-keywords"
          illustration="📈"
          name="SEO Keywords"
          description="Generate high-converting SEO keywords from a subject, name, and so on."
        />
        <TemplateCard
          admin={true}
          link="/business-generator"
          illustration="💡"
          name="Business Idea Generator"
          description="Generate some business ideas based on topics, preferences, or budgets."
        />
        <TemplateCard
          admin={true}
          link="/article"
          illustration="📄"
          name="Article Generator"
          description="Generate incredibly clickable and SEO Friendly article content."
        />
        <TemplateCard
          admin={true}
          link="/plagiarism-checker"
          illustration="©️"
          name="Plagiarism Checker"
          description="Plagiarism checker for sentences and content."
        />
        <TemplateCard
          admin={true}
          link="/pet-name-generator"
          illustration="🐶"
          name="Pet Name Generator"
          description="Generate a great name for your pet."
        />
        <TemplateCard
          admin={true}
          link="/translator"
          illustration="🈳"
          name="Content Translator"
          description="Translate any type of content into your favorite language."
        />
        <TemplateCard
          admin={true}
          link="/domain-name-generator"
          illustration="🔗"
          name="Domain Name Generator"
          description="Generate great domain names for your businesses."
        />
      </SimpleGrid>
    </Box>
  );
}
