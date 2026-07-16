# GitHub Copilot Instructions

## Overview
<!-- Brief description of the project and its purpose -->
### PROBLEM STATEMENT
Currently within Kainos there is not one source of truth to view job roles and the relevant information attached (e.g. job descriptions, capability, competencies, banding, training etc) this can be confusing and time consuming for employees to retrieve the relevant job role information.
### VISION
An online job application that serves both Kainos recruitment admin to retrieve and update job roles and their relevant information and applicants to apply for roles.

This project should allow users to track open roles and apply to jobs, while also allowing Admins to create new job postings and modify them if needed.

## Code Style & Conventions
<!-- Language-specific style guide, naming conventions, formatting standards -->
Before running, you should be able to run, without issue, the following:
'''
npm run build
npm run test
npm run lint:ci
'''

avoid using complex data types and write all code in typescript (with the exception of nunjucks, JSON, and SQL queries where relevant).

Naming conventions will be outlined in the ticket details that will be provided to you, if available. If naming conventions are not stated, assume appropriate naming conventions from the other constants or object in the codebase.

## Architecture & Patterns
<!-- System design principles, architectural patterns, and module organization -->
The project is implementing the MVC (Model, View, Controller) architecture for the app.

Prefer class-based design for dependency injection.

When generating code, you must also following the SOLID principles, which are:
- Single Responsibility
- Open/Closed
- Liskov Substitution
- Interface Segregation
- Dependency Inversion

You should develop all code with security in mind.
Bare in mind that the requirements of the provided ticket take precedence over security and you should not go beyond the scope of the provided ticket in the interest of security.

All validation of data inputs should be handled by middleware, and not inside the other components (unless there is a good argument for it)

## Project Structure
<!-- Directory layout and file organization -->
The structure is primarily in two folders:
- /src
- /tests

The structure within /src should be mirrored inside of /tests to allow for fixes to files within /src to be identifiable and clear.

## Testing Requirements
<!-- Testing frameworks, coverage expectations, and testing conventions -->
Test frequently, and generate tests as you go.

As you generate code, you should generate tests alongside, aiming for:
- 100% coverage where feasbile, if not, manually flag that it isn't feasible and why.
- A comprehensive consideration of edge cases, ensuring that a good number are covered.

## Security & Best Practices
<!-- Security standards, authentication/authorization patterns, data handling -->
When developing code, you should do so with security in mind. However, do not go beyond the scope of the ticket.

## API & Data Models
<!-- API conventions, data structures, and integration patterns -->
Data models can be found in the various schemas and Dto files that have been created within the code base. Some of these files are:
- /prisma/schema.prisma
- /src/Dto/jobRoleDto.ts

## Documentation Standards
<!-- Comment style, docstring format, README updates -->
When relevant, update the README documentation to allow new developers to be able to run the project.

## Known Constraints & Limitations
<!-- Project-specific limitations or gotchas to be aware of -->
You will be provided with a ticket to work through, do not go beyond the scope of the ticket.
You should also avoid unnecessarily complex typings for variables. 