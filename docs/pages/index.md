---
layout: page
title: Hydra LFO - Control utilities for Hydra
permalink: /
---

# Intro

# Usage

## Set up

## Hydra

```
H = hydralfo
```

# Functions

## General

### set

```javascript
H.set().run() // = 0
H.set(1).run() // = 1
H.set(2).set(3).run() // = 3
```

### add / sub

```javascript
H.add().run() // = 0 + 0 = 0
H.add(1).run() // = 0 + 1 = 1

H.set(5).add(4).run() // = 5 + 4 = 9
H.set(5).add(-4).run() // = 5 - 4 = 1

H.set(5).sub(4).run() // = 5 - 4 = 1
H.set(5).sub(-4).run() // = 5 - (-4) = 9
```

### mul / div

### mod

### floor

### map

## Generators

### sin / saw / tri

### rnd

### range

### choose

### iter

## Time manipulation

### speed

### fast / slow

### bpm

