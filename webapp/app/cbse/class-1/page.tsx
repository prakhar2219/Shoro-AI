"use client"

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  HStack,
  Icon,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
  Progress,
} from "@chakra-ui/react"
import { BookOpen, FileText, Users, Clock, ChevronRight, Calculator, Globe, Palette } from "lucide-react"
import Link from "next/link"

const SUBJECTS = [
  {
    id: "english",
    name: "English",
    description: "Language and Literature",
    icon: BookOpen,
    color: "blue",
    chapters: 12,
    progress: 0,
    topics: 45,
  },
  {
    id: "mathematics",
    name: "Mathematics",
    description: "Numbers and Basic Operations",
    icon: Calculator,
    color: "green",
    chapters: 10,
    progress: 0,
    topics: 38,
  },
  {
    id: "evs",
    name: "Environmental Studies",
    description: "Our Environment and Surroundings",
    icon: Globe,
    color: "teal",
    chapters: 8,
    progress: 0,
    topics: 32,
  },
  {
    id: "hindi",
    name: "Hindi",
    description: "Hindi Language and Literature",
    icon: FileText,
    color: "orange",
    chapters: 10,
    progress: 0,
    topics: 40,
  },
  {
    id: "art",
    name: "Art & Craft",
    description: "Creative Arts and Drawing",
    icon: Palette,
    color: "pink",
    chapters: 6,
    progress: 0,
    topics: 24,
  },
]

export default function Class1Page() {
  const bg = useColorModeValue("white", "gray.700")

  return (
    <Box>
      <Container maxW="6xl" py={8}>
        <Breadcrumb spacing="8px" separator={<ChevronRight className="w-4 h-4" />} mb={8}>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href="/">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href="/cbse">
              CBSE
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Class 1</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <VStack spacing={6} align="start" mb={12}>
          <HStack spacing={4}>
            <Icon as={BookOpen} w={12} h={12} color="blue.500" />
            <VStack align="start" spacing={2}>
              <Heading size="2xl">CBSE Class 1</Heading>
              <Text fontSize="lg" color="gray.600">
                Foundation Level - Primary Education
              </Text>
            </VStack>
          </HStack>

          <Text fontSize="md" color="gray.700" maxW="4xl">
            Class 1 is the foundation of formal education. Our curriculum focuses on building basic literacy, numeracy,
            and environmental awareness through interactive and engaging content designed specifically for young
            learners.
          </Text>

          <HStack spacing={8}>
            <HStack spacing={2}>
              <Icon as={Users} w={5} h={5} color="blue.500" />
              <Text fontWeight="semibold">2.5M+ Students</Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={FileText} w={5} h={5} color="blue.500" />
              <Text fontWeight="semibold">5 Subjects</Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={Clock} w={5} h={5} color="blue.500" />
              <Text fontWeight="semibold">Age 5-6 Years</Text>
            </HStack>
          </HStack>
        </VStack>

        <VStack spacing={8} align="start">
          <Heading size="lg">Subjects</Heading>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
            {SUBJECTS.map((subject) => (
              <Card
                key={subject.id}
                as={Link}
                href={`/cbse/class-1/${subject.id}`}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ transform: "translateY(-4px)", shadow: "lg" }}
                bg={bg}
              >
                <CardBody>
                  <VStack spacing={4} align="start">
                    <HStack justify="space-between" w="full">
                      <Icon as={subject.icon} w={8} h={8} color={`${subject.color}.500`} />
                      <Badge colorScheme={subject.color}>{subject.chapters} Chapters</Badge>
                    </HStack>

                    <VStack align="start" spacing={2}>
                      <Heading size="md">{subject.name}</Heading>
                      <Text fontSize="sm" color="gray.600">
                        {subject.description}
                      </Text>
                    </VStack>

                    <Box w="full">
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="xs" color="gray.500">
                          Progress
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {subject.progress}%
                        </Text>
                      </HStack>
                      <Progress value={subject.progress} colorScheme={subject.color} size="sm" />
                    </Box>

                    <HStack justify="space-between" w="full" fontSize="xs" color="gray.500">
                      <Text>{subject.topics} Topics</Text>
                      <Text>Start Learning →</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  )
}
