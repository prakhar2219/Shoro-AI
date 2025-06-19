"use client"

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Progress,
  Button,
  Card,
  CardBody,
  SimpleGrid,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react"
import { Calculator, Clock, BookOpen, PlayCircle, CheckCircle, ArrowLeft, ArrowRight, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const SAMPLE_CONTENT = `
<h2>Numbers 1 to 9 - Counting Objects</h2>

<p>Welcome to your first mathematics lesson! Today we'll learn about numbers 1 to 9 by counting different objects around us.</p>

<h3>What are Numbers?</h3>
<p>Numbers help us count things. Let's start with the numbers 1 to 9:</p>

<ul>
<li><strong>1 (One)</strong> - Like one sun in the sky</li>
<li><strong>2 (Two)</strong> - Like two eyes on your face</li>
<li><strong>3 (Three)</strong> - Like three wheels on a tricycle</li>
<li><strong>4 (Four)</strong> - Like four legs on a chair</li>
<li><strong>5 (Five)</strong> - Like five fingers on one hand</li>
</ul>

<h3>Let's Practice Counting!</h3>
<p>Look around your room and try to find:</p>
<ul>
<li>1 door</li>
<li>2 shoes</li>
<li>3 books</li>
<li>4 corners of a table</li>
<li>5 toys</li>
</ul>

<blockquote>
<p><strong>Remember:</strong> Counting helps us know "how many" of something we have!</p>
</blockquote>

<h3>Fun Activity</h3>
<p>Draw the correct number of objects:</p>
<ul>
<li>Draw 3 apples</li>
<li>Draw 5 stars</li>
<li>Draw 2 flowers</li>
</ul>
`

export default function Chapter1Page() {
  const [content, setContent] = useState(SAMPLE_CONTENT)

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
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href="/cbse/class-1">
              Class 1
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href="/cbse/class-1/mathematics">
              Mathematics
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Chapter 1</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <VStack spacing={6} align="start" mb={8}>
          <HStack spacing={4}>
            <Icon as={Calculator} w={10} h={10} color="green.500" />
            <VStack align="start" spacing={1}>
              <Heading size="xl">Numbers 1 to 9</Heading>
              <Text fontSize="md" color="gray.600">
                Chapter 1 - Counting Objects
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={6}>
            <HStack spacing={2}>
              <Icon as={BookOpen} w={4} h={4} color="green.500" />
              <Text fontSize="sm" fontWeight="semibold">
                Lesson
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={Clock} w={4} h={4} color="gray.500" />
              <Text fontSize="sm">15 minutes</Text>
            </HStack>
            <Badge colorScheme="green">Beginner</Badge>
          </HStack>

          <Box w="full">
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="semibold">
                Lesson Progress
              </Text>
              <Text fontSize="sm" color="gray.500">
                0% Complete
              </Text>
            </HStack>
            <Progress value={0} colorScheme="green" size="md" />
          </Box>
        </VStack>

        <SimpleGrid columns={{ base: 1, lg: 4 }} spacing={8}>
          {/* Main Content */}
          <Box gridColumn={{ base: "1", lg: "1 / 4" }}>
            <Card>
              <CardBody p={8}>
                <Alert status="info" mb={6}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Interactive Lesson!</AlertTitle>
                    <AlertDescription>
                      This lesson includes interactive elements and activities to help you learn better.
                    </AlertDescription>
                  </Box>
                </Alert>

                <Box className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content }} />

                <Divider my={8} />

                <VStack spacing={4} align="stretch">
                  <Heading size="md">Quick Check</Heading>
                  <Text color="gray.600">Test your understanding with these quick questions:</Text>

                  <Card variant="outline">
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <Text fontWeight="semibold">Question 1:</Text>
                        <Text>How many fingers do you have on both hands?</Text>
                        <HStack spacing={2}>
                          <Button size="sm" variant="outline">
                            8
                          </Button>
                          <Button size="sm" variant="outline">
                            9
                          </Button>
                          <Button size="sm" variant="outline" colorScheme="green">
                            10
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card variant="outline">
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <Text fontWeight="semibold">Question 2:</Text>
                        <Text>Count the objects: 🍎🍎🍎</Text>
                        <HStack spacing={2}>
                          <Button size="sm" variant="outline">
                            2
                          </Button>
                          <Button size="sm" variant="outline" colorScheme="green">
                            3
                          </Button>
                          <Button size="sm" variant="outline">
                            4
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </CardBody>
            </Card>
          </Box>

          {/* Sidebar */}
          <Box gridColumn={{ base: "1", lg: "4" }}>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardBody>
                  <VStack spacing={4} align="start">
                    <Heading size="sm">Chapter Progress</Heading>
                    <VStack spacing={3} align="stretch" w="full">
                      <HStack justify="space-between">
                        <HStack spacing={2}>
                          <Icon as={CheckCircle} w={4} h={4} color="green.500" />
                          <Text fontSize="sm">Counting Objects</Text>
                        </HStack>
                        <Badge colorScheme="green" size="sm">
                          Current
                        </Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <HStack spacing={2}>
                          <Icon as={PlayCircle} w={4} h={4} color="gray.400" />
                          <Text fontSize="sm" color="gray.500">
                            Number Recognition
                          </Text>
                        </HStack>
                        <Badge variant="outline" size="sm">
                          Next
                        </Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <HStack spacing={2}>
                          <Icon as={PlayCircle} w={4} h={4} color="gray.400" />
                          <Text fontSize="sm" color="gray.500">
                            Writing Numbers
                          </Text>
                        </HStack>
                      </HStack>
                      <HStack justify="space-between">
                        <HStack spacing={2}>
                          <Icon as={PlayCircle} w={4} h={4} color="gray.400" />
                          <Text fontSize="sm" color="gray.500">
                            Number Games
                          </Text>
                        </HStack>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <VStack spacing={4} align="start">
                    <Heading size="sm">Learning Objectives</Heading>
                    <VStack spacing={2} align="start">
                      <Text fontSize="sm">• Recognize numbers 1-9</Text>
                      <Text fontSize="sm">• Count objects accurately</Text>
                      <Text fontSize="sm">• Understand quantity concepts</Text>
                      <Text fontSize="sm">• Practice number writing</Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Navigation */}
        <HStack justify="space-between" mt={8}>
          <Button
            as={Link}
            href="/cbse/class-1/mathematics"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            variant="outline"
          >
            Back to Mathematics
          </Button>
          <Button rightIcon={<ArrowRight className="w-4 h-4" />} colorScheme="green">
            Next: Number Recognition
          </Button>
        </HStack>
      </Container>
    </Box>
  )
}
