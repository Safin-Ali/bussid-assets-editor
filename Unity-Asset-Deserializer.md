# Parsing Header Info for Unity Assets

> [!Warning]
> This guide may still lack some information and is not fully complete, and it could be expanded further.

This guide provides an overview of how to parse or deserialize Unity asset headers from a binary (hex) block.

## Minimum Meta Size and Size Ranges

Understanding the minimum meta size and its size ranges is crucial for effective parsing of Unity asset headers. The key components include:

1. **Headers of Containing Classes**
2. **Headers of Containing Classes Entry Offset**

## Offsets Overview

The meta size offset count begins with the Unity version name (e.g., `2021.3.40f1`).

### Preceding Data Before Unity Version Name

> [!Note] 
> Before the Unity version name, the following information is stored:
> - Meta Size Length
> - Asset Size Length
> - First File Offset
> - Platform
> - Format

## Version Structure

To effectively parse headers, you need to understand the version structure, including the start, end, and endianness.

### Example: Unity 2021.3.40f1

Here’s how headers are serialized for version `2021.3.40f1`.

#### Meta Size Info Length

- **Offset**: 20 - 23 (Int Data Type = 4 Bytes) (Big Endian)

> [!Important]
> **Considerations**
> - Be aware of the minimum length size and the first class name entry offset.
> - The preceding 4 bytes before the first class name entry offset represent the total length of the classes that store that asset.
> - After the headers, add **6 null bytes** as placeholders for future header placements.
> - Class names are at the top level of headers, meaning they will be the first in the dependencies (as observed in UABE).
> - The FirstFile offset may require adjustment if hex values are inserted or modified. For example, if the FirstFile offset hex value becomes `0x1036`, the new entry position should be `0x1040` because `0x1040` in `40` is a lower address in hex.
> - Be aware of the data type bytes `endianness`.
