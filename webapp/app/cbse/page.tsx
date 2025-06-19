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
} from "@chakra-ui/react"
import { BookOpen, Users, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"

const CBSE_CLASSES = [
  { id: 1, name: "Class 1", subjects: ["English", "Mathematics", "EVS", "Hindi", "Art"], students: "2.5M" },
  { id: 2, name: "Class 2", subjects: ["English", "Mathematics", "EVS", "Hindi", "Art"], students: "2.3M" },
  { id: 3, name: "Class 3", subjects: ["English", "Mathematics", "EVS", "Hindi", "Art", "Computer"], students: "2.1M" },
  { id: 4, name: "Class 4", subjects: ["English", "Mathematics", "EVS", "Hindi", "Art", "Computer"], students: "2.0M" },
  {
    id: 5,
    name: "Class 5",
    subjects: ["English", "Mathematics", "Science", "Social Studies", "Hindi", "Art", "Computer"],
    students: "1.9M",
  },
  {
    id: 6,
    name: "Class 6",
    subjects: ["English", "Mathematics", "Science", "Social Studies", "Hindi", "Sanskrit", "Art", "Computer"],
    students: "1.8M",
  },
  {
    id: 7,
    name: "Class 7",
    subjects: ["English", "Mathematics", "Science", "Social Studies", "Hindi", "Sanskrit", "Art", "Computer"],
    students: "1.7M",
  },
  {
    id: 8,
    name: "Class 8",
    subjects: [
      "English",
      "Mathematics",
      "Science",
      "Social Studies",
      "Hindi",
      "Sanskrit",
      "Art",
      "Computer",
      "Physical Education",
    ],
    students: "1.6M",
  },
  {
    id: 9,
    name: "Class 9",
    subjects: [
      "English",
      "Mathematics",
      "Science",
      "Social Studies",
      "Hindi",
      "Sanskrit",
      "Art",
      "Computer",
      "Physical Education",
      "Health",
    ],
    students: "1.5M",
  },
  {
    id: 10,
    name: "Class 10",
    subjects: [
      "English",
      "Mathematics",
      "Science",
      "Social Studies",
      "Hindi",
      "Sanskrit",
      "Art",
      "Computer",
      "Physical Education",
      "Health",
    ],
    students: "1.4M",
  },
]

export default function CBSEPage() {
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
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>CBSE</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <VStack spacing={6} align="start" mb={12}>
          <HStack spacing={4}>
            <Icon as={BookOpen} w={12} h={12} color="blue.500" />
            <VStack align="start" spacing={2}>
              <Heading size="2xl">CBSE Board</Heading>
              <Text fontSize="lg" color="gray.600">
                Central Board of Secondary Education
              </Text>
            </VStack>
          </HStack>

          <Text fontSize="md" color="gray.700" maxW="4xl">
            The Central Board of Secondary Education (CBSE) is a national level board of education in India for public
            and private schools, controlled and managed by the Government of India. Access comprehensive study
            materials, practice questions, and resources for all CBSE classes.
          </Text>

          <HStack spacing={8}>
            <HStack spacing={2}>
              <Icon as={Users} w={5} h={5} color="blue.500" />
              <Text fontWeight="semibold">15M+ Students</Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={Clock} w={5} h={5} color="blue.500" />
              <Text fontWeight="semibold">Updated Curriculum</Text>
            </HStack>
          </HStack>
        </VStack>

        <VStack spacing={8} align="start">
          <Heading size="lg">Select Your Class</Heading>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
            {CBSE_CLASSES.map((classItem) => (
              <Card
                key={classItem.id}
                as={Link}
                href={`/cbse/class-${classItem.id}`}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ transform: "translateY(-4px)", shadow: "lg" }}
                bg={bg}
              >
                <CardBody>
                  <VStack spacing={4} align="start">
                    <HStack justify="space-between" w="full">
                      <Heading size="md">{classItem.name}</Heading>
                      <Badge colorScheme="blue">{classItem.students}</Badge>
                    </HStack>

                    <Text fontSize="sm" color="gray.600">
                      {classItem.subjects.length} Subjects Available
                    </Text>

                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={2}>
                        Subjects:
                      </Text>
                      <HStack spacing={1} flexWrap="wrap">
                        {classItem.subjects.slice(0, 4).map((subject) => (
                          <Badge key={subject} size="sm" variant="outline">
                            {subject}
                          </Badge>
                        ))}
                        {classItem.subjects.length > 4 && (
                          <Badge size="sm" variant="outline">
                            +{classItem.subjects.length - 4} more
                          </Badge>
                        )}
                      </HStack>
                    </Box>
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
